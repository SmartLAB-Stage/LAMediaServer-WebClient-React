import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import colors from "colors.module.scss";
import {MessageList} from "components/messageList";
import {ModuleList} from "components/moduleList";
import {PersonalInfos} from "components/personalInfos";
import {UserList} from "components/userList";
import {APIRequest} from "helper/APIRequest";
import {
    Channel,
    RawChannel,
} from "model/channel";
import {
    CurrentUser,
    RawCurrentUser,
} from "model/currentUser";
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
import "pages/channel/channel.scss";
import React, {FormEvent} from "react";
import {Form} from "react-bootstrap";

interface ChannelProps {
    currentChannelId: string | null,
    fullURL: string,
}

interface ChannelState {
    activeTextChannel: Channel | null,
    activeVocalChannel: Channel | null,
    currentMessageContent: string,
    meUser: CurrentUser | null,
    openViduSessionInfos: null | {
        sessionId: string,
        targetWebSocketURL: string,
    },
    videoconferencePublisher: VideoconferencePublisher | null,
    videoconferenceSubscribers: VideoconferenceSubscriber[],
}

class ChannelPage extends React.Component<ChannelProps, ChannelState> {
    /**
     * Permet d'annuler les Promise asynchrones une fois l'élément React courant recyclé / la vue changée.
     * @private
     */
    private _active = false;

    private _openVidu: OpenVidu;
    private _openViduSession: Session;

    public constructor(props: ChannelProps) {
        super(props);

        this._openVidu = new OpenVidu();
        this._openViduSession = this._openVidu.initSession();

        this.state = {
            currentMessageContent: "",
            activeTextChannel: null,
            activeVocalChannel: null,
            meUser: null,
            openViduSessionInfos: null,
            videoconferencePublisher: null,
            videoconferenceSubscribers: [],
        };
    }

    public render(): React.ReactNode {
        return (
            <main className={"channels container-fluid py-5 px-4"}>
                <div className={"row rounded-lg overflow-hidden shadow"}>
                    <div className={"col-2 px-0"}>
                        <div className={"row"}>
                            <div className={"col-sm-12"}>
                                <ModuleList
                                    activeTextChannel={this.state.activeTextChannel}
                                    activeTextChannelChangeCallback={(channel: Channel) => {
                                        this._activeTextChannelChangeCallback(channel);
                                    }}
                                    activeVocalChannel={this.state.activeVocalChannel}
                                    activeVocalChannelChangeCallback={(channel: Channel) => {
                                        this._activeVocalChannelChangeCallback(channel);
                                    }}
                                />
                            </div>
                            <div className={"col personal-infos"}>
                                <PersonalInfos
                                    activeVocalChannel={this.state.activeVocalChannel}
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
                            (this.state.activeTextChannel === null ? null : "message-list ")
                        }>
                            {this.state.activeTextChannel === null
                                ? (
                                    <i>
                                        Choisissez une discussion depuis la liste de gauche
                                    </i>
                                ) : (
                                    <MessageList channel={this.state.activeTextChannel}
                                                 key={`message-list-${this.state.activeTextChannel.id}`}
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
                                       disabled={this.state.activeTextChannel === null}
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
                        <UserList currentChannel={this.state.activeTextChannel}
                                  videoconferenceSubscribers={this.state.videoconferenceSubscribers}/>
                    </div>
                </div>
            </main>
        );
    }

    public componentDidMount(): void {
        this._active = true;
        this._updateMyInfos();
        this._fetchCurrentChannel();

        if (this.state.activeTextChannel !== null) {
            window.history.replaceState(null, "", this.props.fullURL.replace(/:[^/]*/, this.state.activeTextChannel.id));
        }
    }

    public componentDidUpdate(_prevProps: ChannelProps, prevState: ChannelState): void {
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
                this.setState({
                    meUser: CurrentUser.fromObject(payload as unknown as RawCurrentUser),
                });
            })
            .send()
            .then();
    }

    private _fetchCurrentChannel(): void {
        if (this.props.currentChannelId === null) {
            return;
        }

        APIRequest
            .get("/module/channel/get")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                channelId: this.props.currentChannelId,
            })
            .onSuccess((payload) => {
                this.setState({
                    activeTextChannel: Channel.fromObject(payload as unknown as RawChannel),
                });
            })
            .send()
            .then();
    }

    private _activeTextChannelChangeCallback(newChannel: Channel): void {
        this.setState({
            activeTextChannel: newChannel,
        });

        let state: Record<string, unknown> = {
            ...this.state,
        };
        state.openViduSession = undefined;
        state.videoconferencePublisher = undefined;

        window.history.pushState(state, "", this.props.fullURL.replace(/:[^/]*/, newChannel.id));
    }

    private _disconnectVideoconference(): void {
        if (this.state.openViduSessionInfos !== null) {
            this._openViduSession.disconnect();
            this.setState({
                activeVocalChannel: null,
                openViduSessionInfos: null,
                videoconferencePublisher: null,
            });
        }
    }

    private _activeVocalChannelChangeCallback(channel: Channel): void {
        if (channel.id !== this.state.openViduSessionInfos?.sessionId) {
            if (this.state.openViduSessionInfos !== null) {
                this._openViduSession.disconnect();
            }

            this._connectToVideoConference(channel);
        }
    }

    private async _handleSendMessage(evt: FormEvent): Promise<void> {
        evt.preventDefault();

        if (this.state.currentMessageContent.length === 0 || this.state.activeTextChannel === null) {
            return;
        }

        await APIRequest
            .post("/module/channel/message/send")
            .authenticate()
            .canceledWhen(() => !this._active)
            .minTime(100)
            .withPayload({
                message: this.state.currentMessageContent,
                channelId: this.state.activeTextChannel.id,
            })
            .send()
            .then();

        this.setState({
            currentMessageContent: "",
        });
    }

    private _onStreamCreated(evt: StreamEvent) {
        const connection = evt.stream.connection;
        const DOM_id = `video-subscriber_${connection.connectionId}`;
        const user = User.fromObject(JSON.parse(connection.data));

        if (user.username !== this.state.meUser?.username) {
            console.warn(user);
            // @ts-ignore
            const subscriber = this._openViduSession.subscribe(evt.stream, null);
            this.setState({
                videoconferenceSubscribers: [
                    ...this.state.videoconferenceSubscribers,
                    {
                        connection,
                        DOM_id,
                        subscriber,
                        user,
                    },
                ],
            });
        }
    }

    private _onStreamDestroyed(evt: StreamEvent) {
        const subscribersConnections: VideoconferenceSubscriber[] = [];

        for (const subscriber of this.state.videoconferenceSubscribers) {
            if (subscriber.connection.connectionId !== evt.stream.connection.connectionId) {
                subscribersConnections.push(subscriber);
            }
        }

        this.setState({
            videoconferenceSubscribers: subscribersConnections,
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

    private _connectToVideoConference(channel: Channel): void {
        APIRequest
            .post("/videoconference/session/connect")
            .canceledWhen(() => !this._active)
            .authenticate()
            .withPayload({
                sessionId: channel.id,
            })
            .onSuccess((payload) => {
                if (payload !== null) {
                    this.setState({
                        activeVocalChannel: channel,
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

export {ChannelPage};
