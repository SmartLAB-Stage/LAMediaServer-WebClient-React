import {Authentication} from "helper/authentication";
import {setGetPayload} from "helper/utils";

interface APIResponseData {
    error?: {
        type: string,
    },
    event: string,
    message: string,
    payload: Record<string, unknown>,
}

type ResponseCallback = (data: Record<string, unknown>, evt: string) => void;

type OpenCallback = () => void;

enum WebSocketServerEvent {
    CHANNEL_CREATED = "channelCreated",
    CHANNEL_DELETED = "channelDeleted",
    CHANNEL_UPDATED = "channelUpdated",
    CHANNEL_USER_LIST = "channelUserList",
    ERROR = "error",
    MESSAGE_CREATED = "messageCreated",
    MESSAGE_DELETED = "messageDeleted",
    MESSAGE_EDITED = "messageEdited",
    MODULE_CREATED = "moduleCreated",
    MODULE_DELETED = "moduleDeleted",
    MODULE_LIST = "moduleList",
    MODULE_UPDATED = "moduleUpdated",
    PRESENCE_UPDATED = "presenceUpdated",
    ROLE_LIST = "roleList",
    USER_UPDATED = "userUpdated",
}

class APIWebSocket {
    private static _APIWebSocket: APIWebSocket | null = null;

    private readonly _webSocket: WebSocket;
    private readonly _openCallbacks: OpenCallback[];
    private readonly _messageCallbacks: { event: WebSocketServerEvent, callback: ResponseCallback }[];

    private constructor() {
        let tokenSanitized: string = "";
        let token = Authentication.getToken();
        if (token !== null) {
            tokenSanitized = token;
        }

        const uri = setGetPayload(APIWebSocket._getFullRoute(), {
            _token: tokenSanitized,
        });

        this._webSocket = new WebSocket(uri);
        this._webSocket.addEventListener("message", (evt) => {
            this._onMessage(evt.data);
        });

        this._webSocket.addEventListener("open", (evt) => {
            this._onOpen();
        });

        this._openCallbacks = [];
        this._messageCallbacks = [];
    }

    public static addListener(event: WebSocketServerEvent,
                              args: Record<string, unknown> | null,
                              callback: ResponseCallback,
    ): void {
        if (this._APIWebSocket === null) {
            this._APIWebSocket = new APIWebSocket();
        }

        this._APIWebSocket._addListener(event, args === null ? {} : args, callback);
    }

    private static _getRawRoute(route: string): string {
        let resRoute = "" +
            `${process.env.REACT_APP_WS_API_PROTOCOL}://` +
            `${process.env.REACT_APP_API_ADDRESS}`;

        if (process.env.REACT_APP_API_PORT !== undefined) {
            resRoute += `:${process.env.REACT_APP_API_PORT}/`;
        }

        resRoute += `${route.replace(/^\/(.*)$/, "$1")}`;

        return resRoute;
    }

    private static _getFullRoute(route: string = ""): string {
        const ENDPOINT_PREFIX = (process.env.REACT_APP_WS_API_ENDPOINT_PREFIX as string)
            .replace(/^(.*)\/$/, "$1")
            .replace(/^\/(.*)$/, "$1");

        return this._getRawRoute(`${ENDPOINT_PREFIX}/${route.replace(/^\/(.*)$/, "$1")}`);
    }

    private _addListener(event: WebSocketServerEvent,
                         args: Record<string, unknown> | null,
                         callback: ResponseCallback,
    ): void {
        const openCallback = () => {
            this._send({
                event,
                args,
            });
        };

        if (this._webSocket.readyState === WebSocket.OPEN) {
            openCallback();
        } else {
            this._openCallbacks.push(openCallback);
        }

        this._messageCallbacks.push({
            event,
            callback,
        });
    }

    private _send(data: Record<string, unknown>) {
        this._webSocket.send(JSON.stringify(data));
    }

    private _onMessage(rawData: APIResponseData | string): void {
        let data: APIResponseData | null = null;

        if (typeof rawData === "object") {
            data = rawData;
        } else {
            try {
                data = JSON.parse(rawData);
            } catch (e) {
                console.error(e);
            }
        }

        if (data !== null) {
            for (const messageCallback of this._messageCallbacks) {
                if (data.event === messageCallback.event) {
                    messageCallback.callback(data.payload, data.event);
                }
            }
        }
    }

    private _onOpen(): void {
        for (const callback of this._openCallbacks) {
            callback();
        }
    }
}

export {
    APIWebSocket,
    WebSocketServerEvent,
};
