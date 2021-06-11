/**
 * Méthodes de requête
 */
import {sleep} from "common/utils";

enum RequestMethod {
    /**
     * Récupération, listing. Cacheable
     */
    GET = "GET",

    /**
     * Update, remplace complètement
     */
    PUT = "PUT",

    /**
     * Update, remplace partiellement
     */
    PATCH = "PATCH",

    /**
     * Crée
     */
    POST = "POST",

    /**
     * Supprime
     */
    DELETE = "DELETE",
}

type RequestInfos = {
    status: number,
    data: Object | null,
}

type ProgressCallback = (loaded: number, total: number, evt: ProgressEvent) => void;

type SuccessCallback = (status: number, data: Object) => void;

type FailureCallback = (status: number, data: Object | null, evt: ProgressEvent) => void;

class APIRequest {
    private readonly _method: RequestMethod;
    private readonly _url: string;
    private _request: XMLHttpRequest;
    private _payload: Object;
    private _minTime: number;

    private constructor(method: RequestMethod, url: string) {
        this._method = method;
        this._url = url;
        this._request = new XMLHttpRequest();
        this._payload = {};
        this._minTime = 0;
    }

    public static get(url: string): APIRequest {
        return new APIRequest(RequestMethod.GET, url);
    }

    public static post(url: string): APIRequest {
        return new APIRequest(RequestMethod.POST, url);
    }

    public static delete(url: string): APIRequest {
        return new APIRequest(RequestMethod.DELETE, url);
    }

    public setPayload(payload: Object): APIRequest {
        this._payload = payload;
        return this;
    }

    public onProgress(callback: ProgressCallback): APIRequest {
        this._onProgress = callback;
        return this;
    }

    public onSuccess(callback: SuccessCallback): APIRequest {
        this._onSuccess = callback;
        return this;
    }

    public onFailure(callback: FailureCallback): APIRequest {
        this._onFailure = callback;
        return this;
    }

    public minTime(time: number): APIRequest {
        this._minTime = time;
        return this;
    }

    public async send(): Promise<void> {
        const start = Date.now();

        await new Promise<void>((resolve, reject) => {
            this._request.addEventListener("progress", (evt) => {
                if (evt.lengthComputable) {
                    this._onProgress(evt.loaded, evt.total, evt);
                } else {
                    this._onProgress(NaN, NaN, evt);
                }
            });

            this._request.addEventListener("load", (evt: any) => {
                const infos = this._getRequestInfos(evt);
                if (infos.data === null || Math.floor(infos.status / 100) !== 2) {
                    this._onFailure(infos.status, infos.data, evt);
                    resolve();
                } else {
                    this._onSuccess(infos.status, infos.data);
                    resolve();
                }
            });

            this._request.addEventListener("error", (evt) => {
                const infos = this._getRequestInfos(evt);
                this._onFailure(infos.status, infos.data, evt);
                resolve();
            });
            // this._request.addEventListener("abort", transferCanceled);

            this._request.open(this._method as string, this._url);
            this._request.send(JSON.stringify(this._payload));
        });

        const duration = Date.now() - start;

        if (duration < this._minTime) {
            await sleep(this._minTime - duration);
        }
    }

    private _onProgress: ProgressCallback = (_loaded, _total, _evt) => undefined;

    private _onSuccess: SuccessCallback = (_status, _data) => undefined;

    private _onFailure: FailureCallback = (_status, _data, _evt) => undefined;

    private _getRequestInfos(evt: any): RequestInfos {
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
            status: status,
            data: data,
        }
    }
}

export default APIRequest;
