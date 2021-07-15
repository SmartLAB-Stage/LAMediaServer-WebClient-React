import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import colors from "colors.module.scss";
import {GroupList} from "components/groupList";
import {MessageList} from "components/messageList";
import {PersonalInfos} from "components/personalInfos";
import {UserList} from "components/userList";
import {APIRequest} from "helper/APIRequest";
import {
    CurrentUser,
    RawCurrentUser,
} from "model/currentUser";
import {Group} from "model/group";
import {Room} from "model/room";
import {User} from "model/user";
import {
    VideoconferencePublisher,
    VideoconferenceSubscriber,
} from "model/videoconference";
import {
    OpenVidu,
    Session,
    StreamEvent,
} from "openvidu-browser";
import React, {FormEvent} from "react";
import {Form} from "react-bootstrap";
import "./room.scss";

interface RoomProps {
    currentRoomId: string | null,
    fullURL: string,
}

interface RoomState {
    currentMessageContent: string,
    currentRoomId: string | null,
    meUser: CurrentUser | null,
    openViduSessionInfos: null | {
        sessionId: string,
        targetWebSocketURL: string,
    },
    videoconferencePublisher: VideoconferencePublisher | null,
    videoconferenceSubscribersConnections: VideoconferenceSubscriber[],
}

class RoomPage extends React.Component<RoomProps, RoomState> {
    /**
     * Permet d'annuler les Promise asynchrones une fois l'élément React courant recyclé / la vue changée.
     * @private
     */
    private _active = false;

    private _openVidu: OpenVidu;
    private _openViduSession: Session;

    public constructor(props: RoomProps) {
        super(props);

        this._openVidu = new OpenVidu();
        this._openViduSession = this._openVidu.initSession();

        this.state = {
            currentMessageContent: "",
            currentRoomId: this.props.currentRoomId,
            meUser: null,
            openViduSessionInfos: null,
            videoconferencePublisher: null,
            videoconferenceSubscribersConnections: [],
        };
    }

    public render(): React.ReactNode {
        return (
            <main className={"rooms container-fluid py-5 px-4"}>
                <div className={"row rounded-lg overflow-hidden shadow"}>
                    <div className={"col-2 px-0"}>
                        <div className={"row"}>
                            <div className={"col-sm-12"}>
                                <GroupList
                                    currentRoomChangeCallback={(room: Room, group: Group) => {
                                        this._currentRoomChangeCallback(room, group);
                                    }}
                                    selectedRoomId={this.state.currentRoomId}
                                    videoConferenceChangeCallback={(room: Room, _group: Group) => {
                                        this._videoConferenceChangeCallback(room);
                                    }}
                                    videoConferenceConnectedRoomId={
                                        this.state.openViduSessionInfos === null
                                            ? null
                                            : this.state.openViduSessionInfos.sessionId
                                    }
                                />
                            </div>
                            <div className={"col personal-infos"}>
                                <PersonalInfos
                                    user={this.state.meUser}
                                    videoconferenceDisconnectCallback={() => this._disconnectVideoconference()}
                                    videoconferencePublisher={this.state.videoconferencePublisher}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={"col-8 px-0"}>
                        <div className={
                            "px-4 " +
                            "py-5 " +
                            "chat-box " +
                            "bg-white " +
                            (this.state.currentRoomId === null ? null : "message-list ")
                        }>
                            {this.state.currentRoomId === null
                                ? (
                                    <i>
                                        Choisissez une discussion depuis la liste de gauche
                                    </i>
                                ) : (
                                    <MessageList
                                        key={`message-list-${this.state.currentRoomId}`}
                                        roomId={this.state.currentRoomId}
                                    />
                                )
                            }
                        </div>

                        <Form onSubmit={(e) => this._handleSendMessage(e)}
                              className={"bg-light"}>
                            <div className={"input-group"}>
                                <input type={"text"}
                                       placeholder={"Entrez votre message"}
                                       aria-describedby={"button-send-message"}
                                       className={"form-control rounded-0 border-0 py-4 bg-light"}
                                       disabled={this.state.currentRoomId === null}
                                       value={this.state.currentMessageContent}
                                       onChange={(e) => {
                                           this.setState({
                                               currentMessageContent: e.target.value,
                                           });
                                       }}
                                />
                                <div className={"input-group-append"}>
                                    <button className={"btn btn-link"}
                                            data-placement={"top"}
                                            data-toggle={"tooltip"}
                                            disabled={this.state.currentMessageContent.length === 0}
                                            id={"button-send-message"}
                                            title={"Envoyer ce message"}
                                            type={"submit"}>
                                        <FontAwesomeIcon icon={"paper-plane"} style={{color: colors.accentColor}}/>
                                    </button>
                                </div>
                            </div>
                        </Form>
                    </div>
                    <div className={"col-2 px-0"}>
                        <UserList currentRoomId={this.state.currentRoomId}/>
                    </div>
                </div>
            </main>
        );
    }

    public componentDidMount(): void {
        this._active = true;
        this._updateMyInfos();

        if (this.state.currentRoomId !== null) {
            window.history.replaceState(null, "", this.props.fullURL.replace(/:[^/]*/, this.state.currentRoomId));
        }
    }

    public componentDidUpdate(_prevProps: RoomProps, prevState: RoomState): void {
        const curInfos = this.state.openViduSessionInfos;
        const prevInfos = prevState.openViduSessionInfos;
        if (curInfos !== prevInfos && curInfos !== null && curInfos?.sessionId !== prevInfos?.sessionId) {
            this._setOpenVidu();
        }
    }

    public componentWillUnmount(): void {
        if (this.state.openViduSessionInfos !== null) {
            this._openViduSession.disconnect();
        }

        this._active = false;
    }

    private _updateMyInfos(): void {
        APIRequest
            .get("/me/get")
            .authenticate()
            .canceledWhen(() => !this._active)
            .onSuccess((payload) => {
                if (payload !== null) {
                    this.setState({
                        meUser: CurrentUser.fromObject(payload as unknown as RawCurrentUser),
                    });
                }
            })
            .send()
            .then();
    }

    private _currentRoomChangeCallback(newRoom: Room, _newGroup: Group): void {
        this.setState({
            currentRoomId: newRoom.id,
        });

        let state: Record<string, unknown> = {
            ...this.state,
        };
        state.openViduSession = undefined;
        state.videoconferencePublisher = undefined;

        window.history.pushState(state, "", this.props.fullURL.replace(/:[^/]*/, newRoom.id));
    }

    private _disconnectVideoconference(): void {
        if (this.state.openViduSessionInfos !== null) {
            this._openViduSession.disconnect();
            this.setState({
                openViduSessionInfos: null,
                videoconferencePublisher: null,
            });
        }
    }

    private _videoConferenceChangeCallback(newRoom: Room): void {
        const streamId = newRoom.id;

        if (streamId !== this.state.openViduSessionInfos?.sessionId) {
            if (this.state.openViduSessionInfos !== null) {
                this._openViduSession.disconnect();
            }

            this._connectToVideoConference(streamId);
        }
    }

    private async _handleSendMessage(evt: FormEvent): Promise<void> {
        evt.preventDefault();

        if (this.state.currentMessageContent.length === 0 || this.state.currentRoomId === null) {
            return;
        }

        await APIRequest
            .post("/group/room/message/send")
            .authenticate()
            .canceledWhen(() => !this._active)
            .minTime(100)
            .withPayload({
                message: this.state.currentMessageContent,
                roomId: this.state.currentRoomId,
            })
            .send()
            .then();

        this.setState({
            currentMessageContent: "",
        });
    }

    private _onStreamCreated(evt: StreamEvent) {
        const connection = evt.stream.connection;
        const user = User.fromObject(JSON.parse(connection.data));

        if (user.username !== this.state.meUser?.username) {
            console.warn(user);
            this.setState({
                videoconferenceSubscribersConnections: [
                    ...this.state.videoconferenceSubscribersConnections,
                    {
                        user,
                        connection,
                    },
                ],
            });

            this._openViduSession.subscribe(evt.stream, `video-subscriber_${connection.connectionId}`);
        }
    }

    private _onStreamDestroyed(evt: StreamEvent) {
        const subscribersConnections: VideoconferenceSubscriber[] = [];

        for (const subscriber of this.state.videoconferenceSubscribersConnections) {
            if (subscriber.connection.connectionId !== evt.stream.connection.connectionId) {
                subscribersConnections.push(subscriber);
            }
        }

        this.setState({
            videoconferenceSubscribersConnections: subscribersConnections,
        });

        /*
        $('#'+e.stream.connection.connectionId+'').remove();
        */
    }

    private _onConnected(): void {
        // @ts-ignore
        const publisher = this._openVidu.initPublisher(null, {
            publishAudio: true,
            publishVideo: true,
        });

        this._openViduSession.publish(publisher).then(() => {
            this.setState({
                videoconferencePublisher: {
                    connection: publisher.stream.connection,
                    publisher,
                    DOM_id: `video-publisher-${this._openViduSession.sessionId}`,
                },
            });
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

    private _setOpenVidu(): void {
        if (this.state.openViduSessionInfos === null) {
            console.error("Invalid state");
            return;
        }

        this._openViduSession.on("streamCreated", (evt) => {
            this._onStreamCreated(evt as StreamEvent);
        });

        this._openViduSession.on("streamDestroyed", (evt) => {
            this._onStreamDestroyed(evt as StreamEvent);
        });

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

        const userData = this.state.meUser?.toJSON();

        this._openViduSession.connect(this.state.openViduSessionInfos.targetWebSocketURL, userData)
            .then(() => this._onConnected())
            .catch((error) => {
                console.error("An error occurred while connecting to the session: " + error.code + " " + error.message);
            });

        this._openViduSession.on("streamPropertyChanged", (evt) => {
            this._onStreamPropertyChanged(evt as StreamEvent & { changedProperty: string });
        });

        this._openViduSession.on("sessionDisconnected", () => {
            // console.warn("session disconnected");
        });
    }

    private _onStreamPropertyChanged(evt: StreamEvent & { changedProperty: string }) {
        if (this.state.videoconferencePublisher === null) {
            return;
        }

        if (evt.stream.connection.connectionId === this.state.videoconferencePublisher.connection.connectionId) {
            if (evt.changedProperty === "audioActive") {
            } else if (evt.changedProperty === "videoActive") {
            }
        } else {
            if (evt.changedProperty === "videoActive") {
            }
        }
    }

    private _connectToVideoConference(id: string): void {
        APIRequest
            .post("/videoconference/session/connect")
            .canceledWhen(() => !this._active)
            .authenticate()
            .withPayload({
                sessionId: id,
            })
            .onSuccess((payload) => {
                if (payload !== null) {
                    this.setState({
                        openViduSessionInfos: {
                            sessionId: payload.sessionId as string,
                            targetWebSocketURL: payload.targetWebSocketURL as string,
                        },
                    });
                }
            })
            .onFailure((status, data) => {
                console.warn("connect nok", status, data);
            })
            .send()
            .then();
    }
}

export {RoomPage};
