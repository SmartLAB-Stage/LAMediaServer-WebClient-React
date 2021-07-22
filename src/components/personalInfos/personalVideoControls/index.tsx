import {
    faMicrophone,
    faMicrophoneSlash,
    faPhoneSlash,
    faVideo,
    faVideoSlash,
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
    audioActive: boolean,
    videoActive: boolean,
}

class PersonalVideoControls extends React.Component<PersonalVideoControlsProps, PersonalVideoControlsState> {
    constructor(props: PersonalVideoControlsProps) {
        super(props);

        if (this.props.videoconferencePublisher === null) {
            this.state = {
                audioActive: false,
                videoActive: false,
            };
        } else {
            this.state = {
                audioActive: this.props.videoconferencePublisher.publisher.stream.audioActive,
                videoActive: this.props.videoconferencePublisher.publisher.stream.videoActive,
            };
        }
    }

    public render(): React.ReactNode {
        return (
            <>
                <Button type={"button"}
                        className={
                            "btn ml-3 mr-1 p-0 " +
                            "btn-" + (this.state.audioActive ? "primary" : "danger") + " " +
                            (this.state.audioActive ? "pl-1 pr-1" : null)
                        }
                        data-toggle={"tooltip"}
                        data-placement={"top"}
                        onClick={() => this._triggerAudio()}
                        title={
                            this.state.audioActive
                                ? "Se rendre muet"
                                : "Réactiver le micro"
                        }>
                    <FontAwesomeIcon icon={this.state.audioActive ? faMicrophone : faMicrophoneSlash}/>
                </Button>
                <Button type={"button"}
                        className={
                            "btn ml-1 mr-1 pl-1 pr-1 p-0 btn-"
                            + (this.state.videoActive ? "primary" : "danger")
                        }
                        data-toggle={"tooltip"}
                        data-placement={"top"}
                        onClick={() => this._triggerVideo()}
                        title={
                            this.state.audioActive
                                ? "Désactiver la caméra"
                                : "Réactiver la caméra"
                        }>
                    <FontAwesomeIcon icon={this.state.videoActive ? faVideo : faVideoSlash}/>
                </Button>
                <Button className={"btn btn-warning ml-1 mr-0 p-0"}
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

    private _triggerAudio(): void {
        if (this.props.videoconferencePublisher !== null) {
            this.props.videoconferencePublisher.publisher.publishAudio(!this.state.audioActive);
            this.setState({
                audioActive: !this.state.audioActive,
            });
        }
    }

    private _triggerVideo(): void {
        if (this.props.videoconferencePublisher !== null) {
            this.props.videoconferencePublisher.publisher.publishVideo(!this.state.videoActive);
            this.setState({
                videoActive: !this.state.videoActive,
            });
        }
    }
}

export {PersonalVideoControls};
