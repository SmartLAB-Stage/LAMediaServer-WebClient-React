import {ProfilePicture} from "components/profilePicture";
import {presenceToReadableInfos} from "model/presence";
import {User} from "model/user";
import React from "react";
import "./singleUser.scss";

interface SingleUserProps {
    openModalUserInfos: () => void,
    user: User,
}

class SingleUser extends React.Component<SingleUserProps, {}> {
    public render(): React.ReactNode {
        const infos = presenceToReadableInfos(this.props.user.status);
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
                    <span className={"badge badge-outline badge-sm badge-pill badge-" + infos.badgeColor}>
                        {infos.status}
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
