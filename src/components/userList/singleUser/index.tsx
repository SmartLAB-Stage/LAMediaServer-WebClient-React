import {PresenceBadge} from "components/shared/presenceBadge";
import {ProfilePicture} from "components/shared/profilePicture";
import {User} from "model/user";
import {VideoconferenceSubscriber} from "model/videoconference";
import React from "react";
import "./singleUser.scss";

interface SingleUserProps {
    openModalUserInfos: () => void,
    videoconferenceSubscriber: VideoconferenceSubscriber | null,
    user: User,
}

class SingleUser extends React.Component<SingleUserProps, {}> {
    public componentDidMount(): void {
        if (this.props.videoconferenceSubscriber !== null) {
            const DOM_id = this.props.videoconferenceSubscriber.DOM_id;
            this.props.videoconferenceSubscriber.subscriber.createVideoElement(DOM_id);
        }
    }

    public componentDidUpdate(prevProps: SingleUserProps): void {
        if (prevProps.videoconferenceSubscriber?.DOM_id !== this.props.videoconferenceSubscriber?.DOM_id) {
            const DOM_id = this.props.videoconferenceSubscriber?.DOM_id;
            this.props.videoconferenceSubscriber?.subscriber.createVideoElement(DOM_id);
        }
    }

    public render(): React.ReactNode {
        return (
            <li>
                <div className={"media single-user"}>
                    <ProfilePicture user={this.props.user}
                                    onClick={() => this.props.openModalUserInfos()}/>
                    <div className={"media-body"}>
                        <span className={"name"}>{this.props.user.name}</span>
                        {this.props.user.isMe ? <span className={"descriptor-me"}> (vous)</span> : null}
                        <br/>
                        <span className={"username"}>{this.props.user.username}</span>
                        <br/>
                        <PresenceBadge presence={this.props.user.status}/>
                    </div>
                </div>
                {
                    this.props.videoconferenceSubscriber === null
                        ? null
                        : <div id={this.props.videoconferenceSubscriber.DOM_id}/>
                }
            </li>
        );
    }
}

export {SingleUser};
