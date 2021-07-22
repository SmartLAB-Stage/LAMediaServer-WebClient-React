import {User} from "model/user";
import {
    Connection,
    Publisher,
    Subscriber,
} from "openvidu-browser";

enum VideoconferenceType {
    AUDIO_ONLY,
    SCREEN_SHARE,
    WEBCAM,
}

interface VideoconferencePublisher {
    connection: Connection,
    DOM_id: string,
    publisher: Publisher,
    videoType: VideoconferenceType,
}

interface VideoconferenceSubscriber {
    connection: Connection,
    DOM_id: string,
    subscriber: Subscriber,
    user: User,
}

export {VideoconferenceType};
export type {
    VideoconferencePublisher,
    VideoconferenceSubscriber,
};
