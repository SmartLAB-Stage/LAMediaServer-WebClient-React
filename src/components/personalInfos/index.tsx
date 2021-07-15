import {PersonalVideoControls} from "components/personalInfos/personalVideoControls";
import {PersonalVideoPreview} from "components/personalInfos/personalVideoPreview";
import {ProfilePicture} from "components/profilePicture";
import {UserInfosModal} from "components/userInfosModal";
import {CurrentUser} from "model/currentUser";
import {VideoconferencePublisher} from "model/videoconference";
import React from "react";
import "./personalInfos.scss";

interface PersonalInfosProps {
    user: CurrentUser | null,
    videoconferenceDisconnectCallback: () => void,
    videoconferencePublisher: VideoconferencePublisher | null,
}

interface PersonalInfosState {
    personalInfosModalOpen: boolean,
}

class PersonalInfos extends React.Component<PersonalInfosProps, PersonalInfosState> {
    public constructor(props: PersonalInfosProps) {
        super(props);

        this.state = {
            personalInfosModalOpen: false,
        };
    }

    public render(): React.ReactNode {
        return (
            <>
                <div className="card border-secondary mb-0 flex-row flex-wrap">
                    <div className="profile-picture-parent card-header border-0">
                        <ProfilePicture user={this.props.user}
                                        onClick={() => {
                                            this.setState({
                                                personalInfosModalOpen: true,
                                            });
                                        }}/>
                    </div>
                    <div className="personal-infos-body card-body text-dark">
                        <p className="card-text">
                            {this.props.user === null
                                ? null
                                : this.props.user.name
                            }
                            <PersonalVideoControls
                                videoconferenceDisconnectCallback={this.props.videoconferenceDisconnectCallback}
                                videoconferencePublisher={this.props.videoconferencePublisher}/>
                        </p>
                    </div>
                    {
                        this.props.videoconferencePublisher === null || this.props.user === null
                            ? null
                            : <PersonalVideoPreview user={this.props.user}
                                                    videoconferencePublisher={this.props.videoconferencePublisher}/>
                    }
                </div>
                {
                    this.props.user === null
                        ? null
                        : <UserInfosModal user={this.props.user}
                                          closeModalAction={() => {
                                              this.setState({
                                                  personalInfosModalOpen: false,
                                              });
                                          }}
                                          modalOpen={this.state.personalInfosModalOpen}/>
                }
            </>
        );
    }
}

export {PersonalInfos};
