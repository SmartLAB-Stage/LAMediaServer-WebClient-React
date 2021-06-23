import {ProfilePicture} from "components/profilePicture";
import {
    User,
    UserStatus,
} from "model/user";
import React from "react";
import "./singleUser.scss";

interface SingleUserProps {
    user: User,
}

class SingleUser extends React.Component<SingleUserProps, {}> {
    public render(): React.ReactNode {
        let badgeColor = "primary";
        let status = "?";

        switch (this.props.user.status) {
            case UserStatus.AWAY:
                badgeColor = "warning";
                status = "Absent";
                break;

            case UserStatus.BUSY:
                badgeColor = "warning";
                status = "Occupé";
                break;

            case UserStatus.ONLINE:
                badgeColor = "success";
                status = "En ligne";
                break;


            case UserStatus.OFFLINE:
                badgeColor = "secondary";
                status = "Hors-ligne";
                break;

            case UserStatus.UNKNOWN:
            default:
                break;
        }

        return (
            <li className={"media singleUser"}>
                <ProfilePicture user={this.props.user}/>
                <div className="media-body">
                    <span className={"name"}>{this.props.user.name}</span>
                    {this.props.user.isMe ? <span className={"descriptor-me"}> (vous)</span> : ""}
                    <br/>
                    <span className={"username"}>{this.props.user.username}</span>
                    <br/>
                    <span className={"badge badge-outline badge-sm badge-pill badge-" + badgeColor}>
                        {status}
                    </span>
                </div>
            </li>
        );
    }
}

export {SingleUser};

/*

<p>
    <span className="badge badge-outline badge-sm badge-info badge-pill">sed</span>
    <span className="badge badge-outline badge-sm badge-primary badge-pill">sed</span>
    <span className="badge badge-outline badge-sm badge-danger badge-pill">voluptatem</span>
</p>

 */
