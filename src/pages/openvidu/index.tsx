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
import "./openvidu.scss";

interface OpenViduPageState {
    subscribersConnections: Connection[],
}

class OpenViduPage extends React.Component<{}, OpenViduPageState> {
    private _active = false;
    private _openVidu: OpenVidu;
    private _publisher: Publisher | null;
    private _session: Session;

    public constructor(props: {}) {
        super(props);

        this._openVidu = new OpenVidu();
        this._publisher = null;
        this._session = this._openVidu.initSession();

        this.state = {
            subscribersConnections: [],
        };
    }

    public componentDidMount(): void {
        this._active = true;
        this._createVideoConferenceRoom();
    }

    public componentWillUnmount(): void {
        this._session.disconnect();
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
            <>
                <div id={"video-publisher"}/>
                {subscribers}
            </>
        );
    }

    private _onStreamCreated(evt: StreamEvent) {
        const connection = evt.stream.connection;

        this.setState({
            subscribersConnections: [
                ...this.state.subscribersConnections,
                connection,
            ],
        });

        this._session.subscribe(evt.stream, `video-subscriber_${connection.connectionId}`);

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

    private _onConnected() {
        this._publisher = this._openVidu.initPublisher("video-publisher", {
            publishAudio: true,
            publishVideo: true,
        });

        this._session.publish(this._publisher).then(() => {
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
        this._session.on("streamCreated", (evt) => this._onStreamCreated(evt as StreamEvent));
        this._session.on("streamDestroyed", (evt) => this._onStreamDestroyed(evt as StreamEvent));

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

        this._session.connect(targetWebSocketURL)
            .then(() => this._onConnected())
            .catch((error) => {
                console.error("An error occurred while connecting to the session: " + error.code + " " + error.message);
            });

        this._session.on("streamPropertyChanged", (evt) => this._onStreamPropertyChanged(evt as StreamEvent & { changedProperty: string }));
        this._session.on("sessionDisconnected", () => {
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
        let id;
        // id = "ses_LIetoRevvE";
        id = null;

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
