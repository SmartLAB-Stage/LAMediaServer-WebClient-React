import {SingleUser} from "components/userList/singleUser";
import {APIRequest} from "helper/APIRequest";
import {APIWebSocket} from "helper/APIWebSocket";
import {Group} from "model/group";
import {Presence} from "model/presence";
import {User} from "model/user";
import React from "react";
import "./userList.scss";

interface UserListProps {
    selectedGroup: Group | null,
}

interface UserListState {
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
                            user={user}
                />,
            );
        }

        return (
            <div className={"user-list"}>
                <ul className={"list-unstyled"}>
                    {users}
                </ul>
            </div>
        );
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
            .onSuccess((status, data) => {
                const users: User[] = [];

                for (const user of data.payload) {
                    users.push(User.fromFullUser(user));
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
            .onResponse((data: WebSocketData[]) => {
                const users = this.state.users;

                for (const elt of data) {
                    for (let i = 0; i < users.length; ++i) {
                        if (elt.user.id === users[i].id) {
                            users[i].setStatus(elt.presence);
                        }
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
