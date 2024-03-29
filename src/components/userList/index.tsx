import {UserInfosModal} from "components/shared/userInfosModal";
import {APIRequest} from "helper/APIRequest";
import {
    APIWebSocket,
    WebSocketServerEvent,
} from "helper/APIWebSocket";
import {Channel} from "model/channel";
import {Presence} from "model/presence";
import {
    RawUser,
    User,
} from "model/user";
import {VideoconferenceSubscriber} from "model/videoconference";
import React from "react";
import {SingleUser} from "./singleUser";
import "./userList.scss";

interface UserListProps {
    currentChannel: Channel | null,
    videoconferenceSubscribers: VideoconferenceSubscriber[],
}

interface UserListState {
    modalUserInfosOpen: boolean,
    selectedUserForInfos: User | null,
    users: User[],
}

class UserList extends React.Component<UserListProps, UserListState> {
    private _active: boolean;

    public constructor(props: UserListProps) {
        super(props);

        this._active = false;

        this.state = {
            modalUserInfosOpen: false,
            selectedUserForInfos: null,
            users: [],
        };
    }

    public componentDidMount(): void {
        this._active = true;

        this._setSocketNameUpdated();
        this._setSocketPresenceUpdated();

        if (this.props.currentChannel !== null) {
            this._updateUsersFromAPI();
        }
    }

    public componentDidUpdate(prevProps: UserListProps): void {
        if (this.props.currentChannel !== null && prevProps.currentChannel?.id !== this.props.currentChannel.id) {
            this._updateUsersFromAPI();
        }
    }

    public componentWillUnmount(): void {
        this._active = false;
    }

    public render(): React.ReactNode {
        const users: React.ReactNode[] = [];

        for (const user of this.state.users) {
            let sub: VideoconferenceSubscriber | null = null;

            for (const subscriber of this.props.videoconferenceSubscribers) {
                if (subscriber.user.id === user.id) {
                    sub = subscriber;
                    break;
                }
            }

            users.push(
                <SingleUser key={user.id}
                            openModalUserInfos={() => this._openModalUserInfos(user)}
                            user={user}
                            videoconferenceSubscriber={sub}/>,
            );
        }

        return (
            <div className={"user-list"}>
                <ul className={"list-unstyled"}>
                    {users}
                    {
                        this.state.selectedUserForInfos
                            ? (
                                <UserInfosModal user={this.state.selectedUserForInfos}
                                                closeModalAction={() => {
                                                    this.setState({
                                                        modalUserInfosOpen: false,
                                                    });
                                                }}
                                                modalOpen={this.state.modalUserInfosOpen}/>
                            ) : null
                    }
                </ul>
            </div>
        );
    }

    private _openModalUserInfos(user: User): void {
        APIRequest
            .get("/user/get")
            .authenticate()
            .withPayload({
                userId: user.id,
            })
            .canceledWhen(() => !this._active)
            .onSuccess((payload) => {
                this.setState({
                    selectedUserForInfos: User.fromObject(payload as unknown as RawUser),
                    modalUserInfosOpen: true,
                });
            })
            .send()
            .then();
    }

    private _updateUsersFromAPI(): void {
        if (this.props.currentChannel === null) {
            return;
        }

        APIRequest
            .get("/module/channel/user/list")
            .authenticate()
            .withPayload({
                channelId: this.props.currentChannel.id,
            })
            .canceledWhen(() => !this._active)
            .onSuccess((payload) => {
                const users: User[] = [];

                for (const user of payload.users as RawUser[]) {
                    users.push(User.fromObject(user));
                }

                this.setState({
                    users,
                });
            })
            .send()
            .then();
    }

    private _setSocketNameUpdated() {
        APIWebSocket.addListener(
            WebSocketServerEvent.USER_UPDATED,
            null,
            () => {
            },
        );
    }

    private _setSocketPresenceUpdated() {
        interface WebSocketData {
            presence: Presence,
            presenceMessage: string,
            user: {
                id: string,
                username: string,
            },
        }

        APIWebSocket.addListener(
            WebSocketServerEvent.PRESENCE_UPDATED,
            null,
            (data: unknown) => {
                const users = this.state.users;
                const updatedUser = data as WebSocketData;

                for (let i = 0; i < users.length; ++i) {
                    if (updatedUser.user.id === users[i].id) {
                        users[i].setStatus(updatedUser.presence);
                        break;
                    }
                }

                this.setState({
                    users,
                });
            },
        );
    }
}

export {UserList};
