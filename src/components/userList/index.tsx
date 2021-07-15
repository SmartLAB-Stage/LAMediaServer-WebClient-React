import {UserInfosModal} from "components/shared/userInfosModal";
import {APIRequest} from "helper/APIRequest";
import {APIWebSocket} from "helper/APIWebSocket";
import {Group} from "model/group";
import {Presence} from "model/presence";
import {
    RawUser,
    User,
} from "model/user";
import React from "react";
import {SingleUser} from "./singleUser";
import "./userList.scss";

interface UserListProps {
    selectedGroup: Group | null,
}

interface UserListState {
    modalUserInfosOpen: boolean,
    selectedUserForInfos: User | null,
    users: User[],
}

class UserList extends React.Component<UserListProps, UserListState> {
    private _active: boolean;
    private readonly _sockets: APIWebSocket[];

    public constructor(props: UserListProps) {
        super(props);

        this._active = false;
        this._sockets = [];

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

        for (const sock of this._sockets) {
            sock.open();
        }
    }

    public componentDidUpdate(prevProps: UserListProps): void {
        if (this.props.selectedGroup !== null && prevProps.selectedGroup !== this.props.selectedGroup) {
            this._updateUsersFromAPI();
        }
    }

    public componentWillUnmount(): void {
        this._active = false;

        for (const sock of this._sockets) {
            sock.close();
        }
    }

    public render(): React.ReactNode {
        const users: React.ReactNode[] = [];

        for (const user of this.state.users) {
            users.push(
                <SingleUser key={user.id}
                            openModalUserInfos={() => this._openModalUserInfos(user)}
                            user={user}
                />,
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
        if (this.props.selectedGroup === null) {
            return;
        }

        APIRequest
            .get("/group/user/list")
            .authenticate()
            .withPayload({
                groupId: this.props.selectedGroup.id,
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
        this._sockets.push(APIWebSocket
            .getSocket("/user/updated")
            .withToken()
            .onResponse((data) => {
            }),
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

        this._sockets.push(APIWebSocket
            .getSocket("/user/presence/updated")
            .withToken()
            .onResponse((data: unknown) => {
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
            }),
        );
    }
}

export {UserList};
