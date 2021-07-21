import {
    faMicrophone,
    faMicrophoneSlash,
    faPhoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {VideoconferencePublisher} from "model/videoconference";
import React from "react";
import {Button} from "react-bootstrap";

interface PersonalVideoControlsProps {
    videoconferenceDisconnectCallback: () => void,
    videoconferencePublisher: VideoconferencePublisher | null,
}

interface PersonalVideoControlsState {
    muted: boolean,
}

class PersonalVideoControls extends React.Component<PersonalVideoControlsProps, PersonalVideoControlsState> {
    constructor(props: PersonalVideoControlsProps) {
        super(props);

        this.state = {
            muted: false,
        };
    }

    public render(): React.ReactNode {
        return (
            <>
                <Button type={"button"}
                        className={
                            "btn ml-4 mr-1 pb-0 pt-0 pl-1 pr-1 btn-"
                            + (this.state.muted ? "danger" : "primary")
                        }
                        data-toggle={"tooltip"}
                        data-placement={"top"}
                        onClick={() => this._triggerMute()}
                        title={
                            this.state.muted
                                ? "Réactiver le micro"
                                : "Se rendre muet"
                        }>
                    <FontAwesomeIcon icon={this.state.muted ? faMicrophoneSlash : faMicrophone}/>
                </Button>
                <Button className={"btn btn-primary ml-1 mr-0 p-0"}
                        data-toggle={"tooltip"}
                        data-placement={"right"}
                        onClick={() => this.props.videoconferenceDisconnectCallback()}
                        title={"Se déconnecter du canal audio actuel"}
                        type={"button"}>
                    <FontAwesomeIcon icon={faPhoneSlash}/>
                </Button>
            </>
        );
    }

    private _triggerMute(): void {
        if (this.props.videoconferencePublisher !== null) {
            if (this.state.muted) {
                this.props.videoconferencePublisher.publisher.publishAudio(true);
            } else {
                this.props.videoconferencePublisher.publisher.publishAudio(false);
            }

            this.setState({
                muted: !this.state.muted,
            });
        }
    }
}

export {PersonalVideoControls};
