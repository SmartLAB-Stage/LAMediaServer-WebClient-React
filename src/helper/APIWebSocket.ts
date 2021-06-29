import {Authentication} from "helper/authentication";

type APIWebSocketCallback = (data: any) => void;

class APIWebSocket {
    private readonly _endpoint: string;
    private _payload: object;
    private _responseCallback: APIWebSocketCallback;
    private _token: string;
    private _webSocket: WebSocket | null;

    private constructor(endpoint: string) {
        this._endpoint = endpoint;
        this._payload = {};
        this._responseCallback = () => {
        };
        this._token = "";
        this._webSocket = null;
    }

    public static getRawRoute(route: string): string {
        let resRoute = "" +
            `${process.env.REACT_APP_WS_API_PROTOCOL}://` +
            `${process.env.REACT_APP_API_ADDRESS}`;

        if (process.env.REACT_APP_API_PORT !== undefined) {
            resRoute += `:${process.env.REACT_APP_API_PORT}/`;
        }

        resRoute += `${route.replace(/^\/(.*)$/, "$1")}`;

        return resRoute;
    }

    public static getFullRoute(route: string): string {
        const ENDPOINT_PREFIX = (process.env.REACT_APP_WS_API_ENDPOINT_PREFIX as string)
            .replace(/^(.*)\/$/, "$1")
            .replace(/^\/(.*)$/, "$1");

        return this.getRawRoute(`${ENDPOINT_PREFIX}/${route.replace(/^\/(.*)$/, "$1")}`);
    }

    public static getSocket(endpoint): APIWebSocket {
        return new this(endpoint);
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

    public withToken(): APIWebSocket {
        let tokenSanitized: string = "";
        let token = Authentication.getToken();
        if (token !== null) {
            tokenSanitized = token;
        }
        this._token = tokenSanitized;
        return this;
    }

    public withPayload(payload: object): APIWebSocket {
        this._payload = payload;
        return this;
    }

    public onResponse(responseCallback: APIWebSocketCallback) {
        this._responseCallback = responseCallback;
        return this;
    }

    public open(): void {
        const uri = APIWebSocket._setGetPayload(APIWebSocket.getFullRoute(this._endpoint), {
            _token: this._token,
            ...this._payload,
        });

        this._webSocket = new WebSocket(uri);
        this._webSocket.onmessage = (evt) => {
            let data = null;
            try {
                data = JSON.parse(evt.data);
            } catch (e) {
                console.error(e);
            }

            if (data !== null) {
                this._responseCallback(data);
            }
        };
    }

    public send(msg: string): void {
        if (this._webSocket === null) {
            console.warn("WebSocket is null");
        } else {
            this._webSocket.send(msg);
        }
    }

    public close(): void {
        if (this._webSocket === null) {
            console.warn("WebSocket is not opened");
        } else {
            this._webSocket.close();
            this._webSocket = null;
        }
    }
}

export {APIWebSocket};
