/**
 * Méthodes de requête
 */
import {Authentication} from "common/authentication";
import {sleep} from "common/utils";

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

/**
 * Informations de requête
 */
type RequestInfos = {
    /**
     * Data
     */
    data: any | null,

    /**
     * Statut HTTP
     */
    status: number,
}

type APIDataType = {
    message: string,
    payload: any | any[],
}

/**
 * Callback de progrès
 */
type ProgressCallback = (loaded: number, total: number, evt: ProgressEvent) => void;

/**
 * Callback de succès
 */
type SuccessCallback = (status: number, data: APIDataType) => any | void;

/**
 * Callback d'échec
 */
type FailureCallback = (status: number, data: APIDataType | null, evt: ProgressEvent) => any | void;

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

    /**
     * Constructeur
     * @param method Méthode
     * @param route Route
     * @private
     */
    private constructor(method: RequestMethod, route: string) {
        const ENDPOINT_PREFIX = (process.env.REACT_APP_API_ENDPOINT_PREFIX as string)
            .replace(/^(.*)\/$/, "$1")
            .replace(/^\/(.*)$/, "$1");

        const fullRoute = "" +
            `${process.env.REACT_APP_API_PROTOCOL}://` +
            `${process.env.REACT_APP_API_ADDRESS}` +
            `:${process.env.REACT_APP_API_PORT}/` +
            `${ENDPOINT_PREFIX}/` +
            `${route.replace(/^\/(.*)$/, "$1")}`;

        this._canceledFunction = () => {
            console.warn("Aucune fonction de détection d'annulation");
            return true;
        };
        this._method = method;
        this._minTime = 0;
        this._payload = {};
        this._request = new XMLHttpRequest();
        this._route = fullRoute;
        this._token = null;
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

    /**
     * Récupère les informations d'une requête
     * @param evt Event
     * @private
     */
    private static _getRequestInfos(evt: any): RequestInfos {
        let status;
        let data;
        const target: XMLHttpRequest | null = evt.target;

        if (target === null) {
            console.debug(evt);
            status = 500;
            data = null;
        } else {
            status = target.status;
            try {
                data = JSON.parse(target.response);
            } catch (e) {
                data = null;
            }
        }

        return {
            status,
            data,
        };
    }

    private static _isGoodStatusCode(statusCode: number): boolean {
        return [200, 201, 204, 304].includes(statusCode);
    }

    /**
     * Configure le payload des requêtes GET
     * @param route Route de base
     * @param payload Payload
     * @private
     */
    private static _setGetPayload(route: string, payload: object): string {
        const keys = Object.keys(payload);
        if (keys.length === 0) {
            return route;
        } else {
            let newRoute = route + "?";

            for (const key of keys) {
                newRoute += `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}&`;
            }

            return newRoute.slice(0, -1);
        }
    }

    public authenticate(): APIRequest {
        this._token = Authentication.getToken();
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
    public async send(): Promise<any | void> {
        const start = Date.now();

        const res = await new Promise<any | void>((resolve) => {
            this._request.addEventListener("progress", (evt) => {
                if (this._canceledFunction()) {
                    return;
                }

                if (evt.lengthComputable) {
                    this._onProgress(evt.loaded, evt.total, evt);
                } else {
                    this._onProgress(NaN, NaN, evt);
                }
            });

            this._request.addEventListener("load", (evt: any) => {
                if (this._canceledFunction()) {
                    return;
                }

                const infos = APIRequest._getRequestInfos(evt);
                if (infos.data === null || !APIRequest._isGoodStatusCode(infos.status)) {
                    resolve(this._onFailure(infos.status, infos.data, evt));
                } else {
                    resolve(this._onSuccess(infos.status, infos.data));
                }
            });

            this._request.addEventListener("error", (evt) => {
                if (this._canceledFunction()) {
                    return;
                }

                const infos = APIRequest._getRequestInfos(evt);
                resolve(this._onFailure(infos.status, infos.data, evt));
            });
            // this._request.addEventListener("abort", transferCanceled);

            if (this._method === RequestMethod.GET) {
                this._request.open(this._method as string, APIRequest._setGetPayload(this._route, this._payload));
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

    private _onProgress: ProgressCallback = (_loaded, _total, _evt) => (void null);

    private _onSuccess: SuccessCallback = (_status, _data) => (void null);

    private _onFailure: FailureCallback = (_status, _data, _evt) => (void null);
}

export {APIRequest};
