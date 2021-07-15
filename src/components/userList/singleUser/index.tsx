import {PresenceBadge} from "components/shared/presenceBadge";
import {ProfilePicture} from "components/shared/profilePicture";
import {User} from "model/user";
import React from "react";
import "./singleUser.scss";

interface SingleUserProps {
    openModalUserInfos: () => void,
    user: User,
}

class SingleUser extends React.Component<SingleUserProps, {}> {
    public render(): React.ReactNode {
        return (
            <li className={"media single-user"}>
                <ProfilePicture user={this.props.user}
                                onClick={() => this.props.openModalUserInfos()}/>
                <div className="media-body">
                    <span className={"name"}>{this.props.user.name}</span>
                    {this.props.user.isMe ? <span className={"descriptor-me"}> (vous)</span> : null}
                    <br/>
                    <span className={"username"}>{this.props.user.username}</span>
                    <br/>
                    <PresenceBadge presence={this.props.user.status}/>
                </div>
            </li>
        );
    }
}

export {SingleUser};
