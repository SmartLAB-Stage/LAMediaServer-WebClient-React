import {User} from "model/user";
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
    user: User,
}

export type {
    VideoconferencePublisher,
    VideoconferenceSubscriber,
};
