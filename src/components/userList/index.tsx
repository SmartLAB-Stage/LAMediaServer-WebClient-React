import {SingleUser} from "components/userList/singleUser";
import {User} from "model/user";
import React from "react";
import "./userList.scss";

interface UserListProps {
    users: User[],
}

class UserList extends React.Component<UserListProps, {}> {
    public render(): React.ReactNode {
        const users: React.ReactNode[] = [];

        for (const user of this.props.users) {
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
}

export {UserList};
