import {APIRequest} from "helper/APIRequest";
import "openvidu-browser";
import {
    Connection,
    OpenVidu,
    Publisher,
    Session,
    StreamEvent,
} from "openvidu-browser";
import React from "react";

interface OpenViduPageState {
    subscribersConnections: Connection[],
}

class OpenViduPage extends React.Component<{}, OpenViduPageState> {
    private _active = false;
    private _publisher: Publisher | null;

    public constructor(props: {}) {
        super(props);

        this._publisher = null;

        this.state = {
            subscribersConnections: [],
        };
    }

    public componentDidMount(): void {
        this._active = true;
        this._createVideoConferenceRoom();
    }

    public componentWillUnmount(): void {
        this._active = false;
    }

    public render(): React.ReactNode {
        const subscribers: React.ReactNode[] = [];

        for (const subscriber of this.state.subscribersConnections) {
            subscribers.push(
                <div id={`video-subscriber_${subscriber.connectionId}`}/>,
            );
        }

        return (
            <div>
                <div id={"video-publisher"}/>
                {subscribers}
            </div>
        );
    }

    private _onStreamCreated(session: Session, evt: StreamEvent) {
        const connection = evt.stream.connection;

        this.setState({
            subscribersConnections: [
                ...this.state.subscribersConnections,
                connection,
            ],
        });

        session.subscribe(evt.stream, `video-subscriber_${connection.connectionId}`);

        /*
        if(e.stream.hasVideo == false){
            $('#'+e.stream.connection.connectionId+' > video').hide();
        }else{
            $('#'+e.stream.connection.connectionId+' > img').hide();
        }*/
    }

    private _onStreamDestroyed(evt: StreamEvent) {
        const subscribersConnections: Connection[] = [];

        for (const subscriber of this.state.subscribersConnections) {
            if (subscriber.connectionId !== evt.stream.connection.connectionId) {
                subscribersConnections.push(subscriber);
            }
        }

        this.setState({
            subscribersConnections,
        });

        /*
        $('#'+e.stream.connection.connectionId+'').remove();
        */
    }

    private _onConnected(openVidu: OpenVidu, session: Session) {
        this._publisher = openVidu.initPublisher("video-publisher", {
            publishAudio: true,
            publishVideo: true,
        });

        session.publish(this._publisher).then(() => {
            // ...
        });

        /*
        publisher.on("streamAudioVolumeChange", (evt) => {
            if (evt.value.newValue > VOLUME_THRESHOLD_PUBLISHER_DB) {
                console.log("en train de parler ?");
            } else {
                // S'arrête de parler
            }
        });*/
    }

    private _setOpenVidu(username, targetWebSocketURL): void {
        const openVidu = new OpenVidu();
        const session = openVidu.initSession();

        session.on("streamCreated", (evt) => this._onStreamCreated(session, evt as StreamEvent));
        session.on("streamDestroyed", (evt) => this._onStreamDestroyed(evt as StreamEvent));

        /*
        session.on("publisherStartSpeaking", (evt) => {
            const e = evt as PublisherSpeakingEvent;
            const id = e.connection.connectionId;
            console.warn(id, "commence à parler");
        });

        session.on("publisherStopSpeaking", (evt) => {
            const e = evt as PublisherSpeakingEvent;
            const id = e.connection.connectionId;
            console.warn(id, "arrête de parler");
        });*/

        session.connect(targetWebSocketURL)
            .then(() => this._onConnected(openVidu, session))
            .catch((error) => {
                console.error("An error occurred while connecting to the session: " + error.code + " " + error.message);
            });

        session.on("streamPropertyChanged", (evt) => this._onStreamPropertyChanged(evt as StreamEvent & { changedProperty: string }));
        session.on("sessionDisconnected", () => {
            // console.warn("session disconnected");
        });
    }

    private _onStreamPropertyChanged(evt: StreamEvent & { changedProperty: string }) {
        if (this._publisher === null) {
            return;
        }

        if (evt.stream.connection.connectionId === this._publisher.stream.connection.connectionId) {
            if (evt.changedProperty === "audioActive") {
            } else if (evt.changedProperty === "videoActive") {
            }
        } else {
            if (evt.changedProperty === "videoActive") {
            }
        }
    }

    private _createVideoConferenceRoom(): void {
        const id = "ses_Uv4FcbxQEw";

        if (id === null) {
            APIRequest
                .post("/videoconference/session/create")
                .unauthorizedErrorsAllowed()
                .canceledWhen(() => !this._active)
                .authenticate()
                .onSuccess((status, data) => {
                    alert(data.payload.id);
                    this._connectToVideoConference(data.payload.id as string);
                })
                .onFailure((status, data) => {
                    console.warn("create nok", status, data);
                })
                .send()
                .then();
        } else {
            this._connectToVideoConference(id);
        }
    }

    private _connectToVideoConference(sessionId: string): void {
        APIRequest
            .post("/videoconference/session/connect")
            .unauthorizedErrorsAllowed()
            .canceledWhen(() => !this._active)
            .authenticate()
            .withPayload({
                sessionId,
            })
            .onSuccess((status, data) => {
                this._setOpenVidu("moi", data.payload.targetWebSocketURL);
            })
            .onFailure((status, data, evt) => {
                console.warn("connect nok", status, data);
            })
            .send()
            .then();
    }
}

export {OpenViduPage};
