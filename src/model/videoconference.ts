import {User} from "model/user";
import {
    Connection,
    Publisher,
    Subscriber,
} from "openvidu-browser";

interface VideoconferencePublisher {
    connection: Connection,
    DOM_id: string,
    publisher: Publisher,
}

interface VideoconferenceSubscriber {
    connection: Connection,
    DOM_id: string,
    subscriber: Subscriber,
    user: User,
}

export type {
    VideoconferencePublisher,
    VideoconferenceSubscriber,
};
