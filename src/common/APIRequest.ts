/**
 * Méthodes de requête
 */
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

class APIRequest {
    private readonly _method: RequestMethod;
    private readonly _url: string;
    private _request: XMLHttpRequest;
    private _payload: Object;

    private constructor(method: RequestMethod, url: string) {
        this._method = method;
        this._url = url;
        this._request = new XMLHttpRequest();
        this._payload = {};
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

    public onProgress(callback: (evt: ProgressEvent) => void): APIRequest {
        this._onProgress = callback;
        return this;
    }

    public onSuccess(callback: (status: number, data: Object) => void): APIRequest {
        this._onSuccess = callback;
        return this;
    }

    public onFailure(callback: (status: number, data: Object | null, evt: ProgressEvent) => void): APIRequest {
        this._onFailure = callback;
        return this;
    }

    public async send(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._request.addEventListener("progress", this._onProgress);
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
    }

    private _onProgress = (_evt: ProgressEvent) => {
    };

    private _onSuccess = (_status: number, _data: Object) => {
    };

    private _onFailure = (_status: number, _data: Object | null, _evt: ProgressEvent) => {
    };

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
