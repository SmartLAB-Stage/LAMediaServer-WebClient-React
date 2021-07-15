/**
 * Méthodes de requête
 */
import {Authentication} from "helper/authentication";
import {
    setGetPayload,
    sleep,
} from "helper/utils";

/**
 * Méthodes de requête
 */
enum RequestMethod {
    /**
     * Supprime
     */
    DELETE = "DELETE",

    /**
     * Récupération, listing. Cacheable
     */
    GET = "GET",

    /**
     * Update, remplace partiellement
     */
    PATCH = "PATCH",

    /**
     * Crée
     */
    POST = "POST",

    /**
     * Update, remplace complètement
     */
    PUT = "PUT",
}

type APIResponsePayload = Record<string, unknown>;

interface APIResponseData {
    error?: {
        type: string,
    },
    message: string,
    payload: APIResponsePayload,
}

/**
 * Informations de requête
 */
type RequestInfos = {
    /**
     * Data
     */
    data: APIResponseData | null,

    /**
     * Statut HTTP
     */
    status: number,
}

/**
 * Callback de progrès
 */
type ProgressCallback = (loaded: number, total: number, evt: ProgressEvent) => void;

/**
 * Callback de succès
 */
type SuccessCallback = (payload: APIResponsePayload, data: APIResponseData, status: number) => unknown | void;

/**
 * Callback d'échec
 */
type FailureCallback = (status: number, data: APIResponseData | null, evt: ProgressEvent) => unknown | void;

/**
 * Requête API
 */
class APIRequest {
    private _canceledFunction: () => boolean;

    /**
     * Méthode
     * @private
     */
    private readonly _method: RequestMethod;

    /**
     * Temps d'exécution minimal
     * @private
     */
    private _minTime: number;

    /**
     * Payload
     * @private
     */
    private _payload: object;

    /**
     * Route
     * @private
     */
    private readonly _route: string;

    /**
     * Requête
     * @private
     */
    private _request: XMLHttpRequest;

    private _token: string | null;

    private _unauthorizedErrorsAllowed: boolean;

    /**
     * Constructeur
     * @param method Méthode
     * @param route Route
     * @private
     */
    private constructor(method: RequestMethod, route: string) {
        this._canceledFunction = () => {
            console.warn(
                "Aucune fonction de détection d'annulation n'est définie, " +
                "cette requête ne sera donc pas exécutée.",
            );
            return true;
        };
        this._method = method;
        this._minTime = 0;
        this._payload = {};
        this._request = new XMLHttpRequest();
        this._route = APIRequest.getFullRoute(route);
        this._token = null;
        this._unauthorizedErrorsAllowed = false;
    }

    /**
     * Effectue une requête DELETE
     * @param route Route
     */
    public static delete(route: string): APIRequest {
        return new APIRequest(RequestMethod.DELETE, route);
    }

    /**
     * Effectue une requête GET
     * @param route Route
     */
    public static get(route: string): APIRequest {
        return new APIRequest(RequestMethod.GET, route);
    }

    /**
     * Effectue une requête POST
     * @param route Route
     */

    public static post(route: string): APIRequest {
        return new APIRequest(RequestMethod.POST, route);
    }

    /**
     * Effectue une requête PUT
     * @param route Route
     */

    public static put(route: string): APIRequest {
        return new APIRequest(RequestMethod.PUT, route);
    }

    public static getRawRoute(route: string): string {
        let resRoute = "" +
            `${process.env.REACT_APP_REST_API_PROTOCOL}://` +
            `${process.env.REACT_APP_API_ADDRESS}`;

        if (process.env.REACT_APP_API_PORT !== undefined) {
            resRoute += `:${process.env.REACT_APP_API_PORT}/`;
        }

        resRoute += `${route.replace(/^\/(.*)$/, "$1")}`;

        return resRoute;
    }

    public static getFullRoute(route: string): string {
        const ENDPOINT_PREFIX = (process.env.REACT_APP_REST_API_ENDPOINT_PREFIX as string)
            .replace(/^(.*)\/$/, "$1")
            .replace(/^\/(.*)$/, "$1");

        return this.getRawRoute(`${ENDPOINT_PREFIX}/${route.replace(/^\/(.*)$/, "$1")}`);
    }

    /**
     * Récupère les informations d'une requête
     * @param evt Event
     * @private
     */
    private static _getRequestInfos(evt: ProgressEvent<XMLHttpRequestEventTarget>): RequestInfos {
        let status;
        let data;
        // @ts-ignore
        const target: XMLHttpRequest | null = evt.target;

        if (target === null) {
            console.debug(evt);
            data = null;
            status = 500;
        } else {
            try {
                data = JSON.parse(target.response);
            } catch (e) {
                data = null;
            }
            status = target.status;
        }

        return {
            data,
            status,
        };
    }

    private static _isGoodStatusCode(statusCode: number): boolean {
        return [200, 201, 204, 304].includes(statusCode);
    }

    public authenticate(): APIRequest {
        this._token = Authentication.getToken();
        return this;
    }

    public unauthorizedErrorsAllowed(): APIRequest {
        this._unauthorizedErrorsAllowed = true;
        return this;
    }

    public canceledWhen(canceled: () => boolean): APIRequest {
        this._canceledFunction = canceled;
        return this;
    }

    /**
     * Set le payload
     * @param payload Payload
     */
    public withPayload(payload: object): APIRequest {
        this._payload = payload;
        return this;
    }

    /**
     * Set le callback de progrès
     * @param callback Callback
     */
    public onProgress(callback: ProgressCallback): APIRequest {
        this._onProgress = callback;
        return this;
    }

    /**
     * Set le callback de succès
     * @param callback Callback
     */
    public onSuccess(callback: SuccessCallback): APIRequest {
        this._onSuccess = callback;
        return this;
    }

    /**
     * Set le callback d'échec
     * @param callback Callback
     */
    public onFailure(callback: FailureCallback): APIRequest {
        this._onFailure = callback;
        return this;
    }

    /**
     * Set le temps minimum de la requête
     * @param time Temps minimum en ms
     */
    public minTime(time: number): APIRequest {
        this._minTime = time;
        return this;
    }

    /**
     * Envoie la requête
     */
    public async send(): Promise<unknown | void> {
        const start = Date.now();

        const onFailure = (status: number, data: APIResponseData | null, evt: ProgressEvent): unknown => {
            if (status === 401 && !this._unauthorizedErrorsAllowed) {
                console.debug("Vous avez été déconnecté");
                Authentication.clearToken();
                window.location.href = "/";
            }

            console.warn(`Erreur de requête: code ${status}, data:`, data);

            return this._onFailure(status, data, evt);
        };

        const res = await new Promise<unknown | void>((resolve) => {
            this._request.addEventListener("progress", (evt: ProgressEvent<XMLHttpRequestEventTarget>) => {
                if (this._canceledFunction()) {
                    return;
                }

                if (evt.lengthComputable) {
                    this._onProgress(evt.loaded, evt.total, evt);
                } else {
                    this._onProgress(NaN, NaN, evt);
                }
            });

            this._request.addEventListener("load", (evt: ProgressEvent<XMLHttpRequestEventTarget>) => {
                if (this._canceledFunction()) {
                    return;
                }

                const infos = APIRequest._getRequestInfos(evt);
                if (infos.data === null || !APIRequest._isGoodStatusCode(infos.status)) {
                    resolve(onFailure(infos.status, infos.data, evt));
                } else {
                    resolve(this._onSuccess(infos.data.payload, infos.data, infos.status));
                }
            });

            this._request.addEventListener("error", (evt: ProgressEvent<XMLHttpRequestEventTarget>) => {
                if (this._canceledFunction()) {
                    return;
                }

                const infos = APIRequest._getRequestInfos(evt);
                resolve(onFailure(infos.status, infos.data, evt));
            });
            // this._request.addEventListener("abort", transferCanceled);

            if (this._method === RequestMethod.GET) {
                this._request.open(this._method as string, setGetPayload(this._route, this._payload));
            } else {
                this._request.open(this._method as string, this._route);
            }

            this._request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            if (this._token !== null) {
                this._request.setRequestHeader("Authorization", `Basic ${this._token}`);
            }

            // NOTE: Aucun payload ne sera set pour GET ou HEAD,
            //       il faut utiliser une route `...?a=b&c=d`, générée plus au dessus à partir du payload fourni
            this._request.send(JSON.stringify(this._payload));
        });

        const duration = Date.now() - start;

        if (duration < this._minTime) {
            await sleep(this._minTime - duration);
        }

        return res;
    }

    private _onProgress: ProgressCallback = () => (void null);

    private _onSuccess: SuccessCallback = () => (void null);

    private _onFailure: FailureCallback = () => (void null);
}

export {APIRequest};
