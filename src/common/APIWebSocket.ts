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
        const ENDPOINT_PREFIX = (process.env.REACT_APP_WS_API_ENDPOINT_PREFIX as string)
            .replace(/^(.*)\/$/, "$1")
            .replace(/^\/(.*)$/, "$1");

        return "" +
            `${process.env.REACT_APP_WS_API_PROTOCOL}://` +
            `${process.env.REACT_APP_API_ADDRESS}` +
            `:${process.env.REACT_APP_API_PORT}/` +
            `${ENDPOINT_PREFIX}/` +
            `${route.replace(/^\/(.*)$/, "$1")}`;
    }

    public static getSocket(endpoint): APIWebSocket {
        return new this(endpoint);
    }

    public withToken(token: string | undefined): APIWebSocket {
        let tokenSanitized: string = "";
        if (token !== undefined) {
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
        this._webSocket = new WebSocket(APIWebSocket.getRawRoute(this._endpoint));
        this._webSocket.onmessage = (evt) => {
            console.log(evt.data);
            this._responseCallback(evt.data);
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
