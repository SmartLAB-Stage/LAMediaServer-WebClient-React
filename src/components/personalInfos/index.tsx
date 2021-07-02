import {PersonalVideoPreview} from "components/personalInfos/personalVideoPreview";
import {ProfilePicture} from "components/profilePicture";
import {User} from "model/user";
import {VideoconferencePublisher} from "model/videoconference";
import React from "react";
import "./personalInfos.scss";

interface PersonalInfosProps {
    user: User | null,
    videoconferencePublisher: VideoconferencePublisher | null,
}

class PersonalInfos extends React.Component<PersonalInfosProps, {}> {
    public render(): React.ReactNode {
        return (
            <div className="card border-secondary mb-0 flex-row flex-wrap">
                <div className="profile-picture-parent card-header border-0">
                    <ProfilePicture user={this.props.user}/>
                </div>
                <div className="personal-infos-body card-body text-dark">
                    <p className="card-text">
                        {this.props.user === null
                            ? <i>En cours de rafraichissement...</i>
                            : this.props.user.name
                        }
                    </p>
                </div>
                {
                    this.props.videoconferencePublisher === null || this.props.user === null
                        ? ""
                        : <PersonalVideoPreview user={this.props.user}
                                                videoconferencePublisher={this.props.videoconferencePublisher}/>
                }

            </div>
        );
    }
}

export {PersonalInfos};
