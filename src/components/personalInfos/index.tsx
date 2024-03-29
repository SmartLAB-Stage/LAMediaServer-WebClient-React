import {ProfilePicture} from "components/shared/profilePicture";
import {UserInfosModal} from "components/shared/userInfosModal";
import {Channel} from "model/channel";
import {CurrentUser} from "model/currentUser";
import {VideoconferencePublisher} from "model/videoconference";
import React from "react";
import "./personalInfos.scss";
import {PersonalVideoControls} from "./personalVideoControls";
import {PersonalVideoPreview} from "./personalVideoPreview";

interface PersonalInfosProps {
    activeVocalChannel: Channel | null,
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
                <div className={"card border-secondary mb-0 flex-row flex-wrap"}>
                    <div className={"profile-picture-parent card-header border-0"}>
                        <ProfilePicture user={this.props.user}
                                        onClick={() => {
                                            this.setState({
                                                personalInfosModalOpen: true,
                                            });
                                        }}/>
                    </div>
                    <div className={"personal-infos-body card-body text-dark"}>
                        {
                            this.props.activeVocalChannel === null
                                ? null
                                : (
                                    <>
                                        <i>Connecté à <br/> "{this.props.activeVocalChannel.name}"</i>
                                    </>
                                )
                        }
                        <p className={"card-text"}>
                            {this.props.user === null
                                ? null
                                : this.props.user.name
                            }
                            {
                                this.props.videoconferencePublisher === null
                                    ? null
                                    : <PersonalVideoControls
                                        videoconferenceDisconnectCallback={this.props.videoconferenceDisconnectCallback}
                                        videoconferencePublisher={this.props.videoconferencePublisher}/>
                            }
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
