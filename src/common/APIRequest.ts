/**
 * Méthodes de requête
 */
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
     * Statut HTTP
     */
    status: number,

    /**
     * Data
     */
    data: any | null,
}

/**
 * Callback de progrès
 */
type ProgressCallback = (loaded: number, total: number, evt: ProgressEvent) => void;

/**
 * Callback de succès
 */
type SuccessCallback = (status: number, data: Object) => void;

/**
 * Callback d'échec
 */
type FailureCallback = (status: number, data: Object | null, evt: ProgressEvent) => void;

/**
 * Requête API
 */
class APIRequest {
    /**
     * Méthode
     * @private
     */
    private readonly _method: RequestMethod;

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

    /**
     * Payload
     * @private
     */
    private _payload: any;

    /**
     * Temps d'exécution minimal
     * @private
     */
    private _minTime: number;

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

        this._method = method;
        this._route = fullRoute;
        this._request = new XMLHttpRequest();
        this._payload = {};
        this._minTime = 0;
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
     * Effectue une requête DELETE
     * @param route Route
     */
    public static delete(route: string): APIRequest {
        return new APIRequest(RequestMethod.DELETE, route);
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

    /**
     * Set le payload
     * @param payload Payload
     */
    public withPayload(payload: any = {}): APIRequest {
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
    public async send(): Promise<void> {
        const start = Date.now();

        await new Promise<void>((resolve) => {
            this._request.addEventListener("progress", (evt) => {
                if (evt.lengthComputable) {
                    this._onProgress(evt.loaded, evt.total, evt);
                } else {
                    this._onProgress(NaN, NaN, evt);
                }
            });

            this._request.addEventListener("load", (evt: any) => {
                const infos = APIRequest._getRequestInfos(evt);
                if (infos.data === null || Math.floor(infos.status / 100) !== 2) {
                    this._onFailure(infos.status, infos.data, evt);
                    resolve();
                } else {
                    this._onSuccess(infos.status, infos.data);
                    resolve();
                }
            });

            this._request.addEventListener("error", (evt) => {
                const infos = APIRequest._getRequestInfos(evt);
                this._onFailure(infos.status, infos.data, evt);
                resolve();
            });
            // this._request.addEventListener("abort", transferCanceled);

            this._request.open(this._method as string, this._route); // FIXME: Utiliser le 3e paramètre ?
            this._request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            this._request.send(JSON.stringify(this._payload));
        });

        const duration = Date.now() - start;

        if (duration < this._minTime) {
            await sleep(this._minTime - duration);
        }
    }

    private _onProgress: ProgressCallback = (_loaded, _total, _evt) => (void null);

    private _onSuccess: SuccessCallback = (_status, _data) => (void null);

    private _onFailure: FailureCallback = (_status, _data, _evt) => (void null);
}

export {APIRequest};
