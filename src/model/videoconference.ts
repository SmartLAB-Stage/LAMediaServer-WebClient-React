import {
    Connection,
    Publisher,
} from "openvidu-browser";

interface VideoconferencePublisher {
    connection: Connection,
    publisher: Publisher,
    DOM_id: string,
}

interface VideoconferenceSubscriber {
    connection: Connection,
    username: string,
}

export type {
    VideoconferencePublisher,
    VideoconferenceSubscriber,
};
