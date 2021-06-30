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
import React, {FormEvent} from "react";
import {Form} from "react-bootstrap";
import "./room.scss";

interface HomeProps {
    currentRoomId: string | null,
    fullURL: string,
}

interface HomeState {
    currentMessageContent: string,
    currentRoomId: string | null,
    groups: Group[],
    messages: Message[],
    meUser: User | null,
    selectedGroup: Group | null,
    users: User[],
}

class RoomPage extends React.Component<HomeProps, HomeState> {
    /**
     * Permet d'annuler les Promise asynchrones une fois l'élément React courant recyclé / la vue changée.
     * @private
     */
    private _active = false;

    public constructor(props: HomeProps) {
        super(props);

        this.state = {
            currentMessageContent: "",
            currentRoomId: this.props.currentRoomId,
            groups: [],
            messages: [],
            meUser: null,
            selectedGroup: null,
            users: [],
        };

        this._updateGroupsFromAPI();

        if (this.state.currentRoomId === null) {
            this._updateMyInfos();
        } else {
            window.history.replaceState(null, "", this.props.fullURL.replace(/:[^/]*/, this.state.currentRoomId));
            this._updateMessagesFromAPI();
        }
    }

    public render(): React.ReactNode {
        return (
            <main className={"rooms container-fluid py-5 px-4"}>
                <div className={"row rounded-lg overflow-hidden shadow"}>
                    <div className={"col-3 px-0"}>
                        <div className={"row"}>
                            <div className={"col-sm-12"}>
                                <GroupList
                                    currentRoomChangeCallback={(room: Room, group: Group) => this._currentRoomChangeCallback(room, group)}
                                    groups={this.state.groups}
                                    selectedRoomFound={(group: Group) => this._updateUsersFromAPI(group)}
                                    selectedRoomId={this.state.currentRoomId}
                                />
                            </div>
                            <div className={"col personalInfos"}>
                                <PersonalInfos user={this.state.meUser}/>
                            </div>
                        </div>
                    </div>

                    <div className={"col-7 px-0"}>
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
                                       onChange={(e) => this.setState({
                                           currentMessageContent: e.target.value,
                                       })}
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
    }

    public componentWillUnmount(): void {
        this._active = false;
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

        window.history.pushState(this.state, "", this.props.fullURL.replace(/:[^/]*/, newRoom.id));
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
}

export {RoomPage};
