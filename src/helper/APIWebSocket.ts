import {Authentication} from "helper/authentication";
import {setGetPayload} from "helper/utils";

interface APIResponseData {
    error?: {
        type: string,
    },
    message: string,
    payload: Record<string, unknown>,
}

type ResponseCallback = (data: Record<string, unknown>) => void;

type OpenCallback = (socket: APIWebSocket) => void;

class APIWebSocket {
    private readonly _endpoint: string;
    private _openCallback: OpenCallback;
    private _payload: object;
    private _responseCallback: ResponseCallback;
    private _token: string;
    private _webSocket: WebSocket | null;

    private constructor(endpoint: string) {
        this._endpoint = endpoint;
        this._openCallback = () => void null;
        this._payload = {};
        this._responseCallback = () => void null;
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

    public onResponse(responseCallback: ResponseCallback): APIWebSocket {
        this._responseCallback = responseCallback;
        return this;
    }

    public onOpen(openCallback: () => void): APIWebSocket {
        this._openCallback = openCallback;
        return this;
    }

    public open(): void {
        const uri = setGetPayload(APIWebSocket.getFullRoute(this._endpoint), {
            _token: this._token,
            ...this._payload,
        });

        this._webSocket = new WebSocket(uri);
        this._webSocket.onmessage = (evt) => {
            let data: APIResponseData | null = null;
            try {
                data = JSON.parse(evt.data);
            } catch (e) {
                console.error(e);
            }

            if (data !== null) {
                this._responseCallback(data.payload);
            }
        };
        this._webSocket.onopen = () => this._openCallback(this);
    }

    public send(msg: Record<string, unknown>): void {
        if (this._webSocket === null) {
            console.warn("WebSocket is null");
        } else {
            this._webSocket.send(JSON.stringify(msg));
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
