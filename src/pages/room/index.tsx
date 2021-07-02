import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import colors from "colors.module.scss";
import {GroupList} from "components/groupList";
import {MessageList} from "components/messageList";
import {PersonalInfos} from "components/personalInfos";
import {UserList} from "components/userList";
import {APIRequest} from "helper/APIRequest";
import {Group} from "model/group";
import {Message} from "model/message";
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
    groups: Group[],
    messages: Message[],
    meUser: User | null,
    selectedGroup: Group | null,
    users: User[],
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
    private _session: Session;

    public constructor(props: RoomProps) {
        super(props);

        this._openVidu = new OpenVidu();
        this._session = this._openVidu.initSession();

        this.state = {
            currentMessageContent: "",
            currentRoomId: this.props.currentRoomId,
            groups: [],
            messages: [],
            meUser: null,
            selectedGroup: null,
            users: [],
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
                                    groups={this.state.groups}
                                    selectedRoomFound={(group: Group) => this._updateUsersFromAPI(group)}
                                    selectedRoomId={this.state.currentRoomId}
                                />
                            </div>
                            <div className={"col personal-infos"}>
                                <PersonalInfos
                                    user={this.state.meUser}
                                    videoconferencePublisher={this.state.videoconferencePublisher}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={"col-8 px-0"}>
                        <div
                            className={"px-4 py-5 chat-box bg-white " + (this.state.currentRoomId === null ? "" : "message-list")}>
                            {this.state.currentRoomId === null
                                ? (
                                    <i>
                                        Choisissez une discussion depuis la liste de gauche
                                    </i>
                                ) : (
                                    <MessageList
                                        key={this.state.currentRoomId}
                                        messagesRefreshed={(newMessages: Message[] | null) => {
                                            if (newMessages === null) {
                                                this._updateMessagesFromAPI();
                                            } else {
                                                this._messagesRefreshed(newMessages);
                                            }
                                        }}
                                        roomId={this.state.currentRoomId}
                                        messages={this.state.messages}
                                    />
                                )
                            }
                        </div>

                        <Form onSubmit={(e) => this._handleSendMessage(e)}
                              className={"bg-light"}>
                            <div className={"input-group"}>
                                <input type={"text"}
                                       placeholder={"Entrez votre message"}
                                       aria-describedby={"button-addon2"}
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
                                    <button id={"button-addon2"}
                                            type={"submit"}
                                            disabled={this.state.currentMessageContent.length === 0}
                                            className={"btn btn-link"}>
                                        <FontAwesomeIcon icon={"paper-plane"} style={{color: colors.accentColor}}/>
                                    </button>
                                </div>
                            </div>
                        </Form>
                    </div>
                    <div className={"col-2 px-0"}>
                        <UserList users={this.state.users}/>
                    </div>
                </div>
            </main>
        );
    }

    public componentDidMount(): void {
        this._active = true;
        this._updateGroupsFromAPI();

        if (this.state.currentRoomId === null) {
            this._updateMyInfos();
        } else {
            window.history.replaceState(null, "", this.props.fullURL.replace(/:[^/]*/, this.state.currentRoomId));
            this._updateMessagesFromAPI();
        }
    }

    public componentWillUnmount(): void {
        this._session.disconnect();
        this._active = false;
    }

    public componentDidUpdate(prevProps: {}, prevState: RoomState): void {
        if (prevState.meUser === null && this.state.meUser !== null) {
            this._createVideoConferenceRoom();
            /*
            const id = window.prompt("Room ID");
            if (id === "" || id === null) {
                this._createVideoConferenceRoom();
            } else {
                this._connectToVideoConference(id);
            }*/
        }
    }

    private _updateMyInfos(): void {
        APIRequest
            .get("/me/get")
            .authenticate()
            .canceledWhen(() => !this._active)
            .onSuccess((status, data) => {
                const me = User.fromFullUser(data.payload);

                this.setState({
                    meUser: me,
                });
            })
            .send()
            .then();
    }

    private _messagesRefreshed(newMessages: Message[]) {
        const messages = this.state.messages;

        for (const message of newMessages) {
            messages.push(message);
        }

        this.setState({
            messages,
        });
    }

    private _currentRoomChangeCallback(newRoom: Room, newGroup: Group): void {
        this.setState({
            currentRoomId: newRoom.id,
            selectedGroup: newGroup,
        });

        let state: any = {
            ...this.state,
        };
        state.videoconferencePublisher = undefined;

        window.history.pushState(state, "", this.props.fullURL.replace(/:[^/]*/, newRoom.id));
        this._updateMessagesFromAPI(newRoom.id);
        this._updateUsersFromAPI(newGroup);
    }

    private _updateGroupsFromAPI(): void {
        APIRequest
            .get("/group/list")
            .authenticate()
            .canceledWhen(() => !this._active)
            .onSuccess((status, data) => {
                const groups: Group[] = [];

                for (const group of data.payload) {
                    groups.push(Group.fromFullObject(group));
                }

                this.setState({
                    groups,
                });
            })
            .send()
            .then();
    }

    private _updateUsersFromAPI(selectedGroup: Group): void {
        APIRequest
            .get("/group/user/list")
            .authenticate()
            .withPayload({
                groupId: selectedGroup.id,
            })
            .canceledWhen(() => !this._active)
            .onSuccess((status, data) => {
                const users: User[] = [];

                for (const user of data.payload) {
                    users.push(User.fromFullUser(user));
                }

                if (this.state.meUser === null) {
                    for (const user of users) {
                        if (user.isMe) {
                            this.setState({
                                meUser: user,
                            });
                            break;
                        }
                    }
                }

                this.setState({
                    users,
                });
            })
            .send()
            .then();
    }

    private _updateMessagesFromAPI(currentRoomId: string | null = null): void {
        APIRequest
            .get("/group/room/message/list")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                roomId: currentRoomId === null ? this.state.currentRoomId : currentRoomId,
            })
            .onSuccess((status, data) => {
                const messages: Message[] = [];

                for (const message of data.payload) {
                    messages.unshift(Message.fromFullMessage(message));
                }

                this.setState({
                    messages,
                });
            })
            .send()
            .then();
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
        const data = JSON.parse(connection.data);

        console.warn(data);

        this.setState({
            videoconferenceSubscribersConnections: [
                ...this.state.videoconferenceSubscribersConnections,
                {
                    username: data.username,
                    connection,
                },
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

    private _onConnected() {
        // @ts-ignore
        const publisher = this._openVidu.initPublisher(null, {
            publishAudio: true,
            publishVideo: true,
        });

        this._session.publish(publisher).then(() => {
            this.setState({
                videoconferencePublisher: {
                    connection: publisher.stream.connection,
                    publisher,
                    DOM_id: "video-publisher",
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

    private _setOpenVidu(targetWebSocketURL: string): void {
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

        const userData = {
            username: this.state.meUser?.username,
        };

        this._session.connect(targetWebSocketURL, userData)
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

    private _createVideoConferenceRoom(): void {
        APIRequest
            .post("/videoconference/session/create")
            .unauthorizedErrorsAllowed()
            .canceledWhen(() => !this._active)
            .authenticate()
            .onSuccess((status, data) => {
                // alert(data.payload.id);
                this._connectToVideoConference(data.payload.id as string);
            })
            .onFailure((status, data) => {
                console.warn(status, data);
            })
            .send()
            .then();
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
                this._setOpenVidu(data.payload.targetWebSocketURL);
            })
            .onFailure((status, data) => {
                console.warn("connect nok", status, data);
                this._createVideoConferenceRoom();
            })
            .send()
            .then();
    }
}

export {RoomPage};
