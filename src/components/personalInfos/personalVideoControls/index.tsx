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

class PersonalVideoControls extends React.Component<PersonalVideoControlsProps, {}> {
    public render(): React.ReactNode {
        let muted = true;
        let connected = false;

        if (this.props.videoconferencePublisher !== null) {
            // TODO: Gérer la demande de coupure de son
            muted = false;
            connected = true;
        }

        return (
            <>
                <Button className={"btn btn-primary ml-4 mr-1 pb-0 pt-0 pl-1 pr-1"}
                        data-toggle={"tooltip"}
                        data-placement={"top"}
                        disabled={!connected}
                        onClick={() => void null}
                        title={
                            muted
                                ? "Réactiver le micro"
                                : "Se rendre muet"
                        }
                        type={"button"}>
                    <FontAwesomeIcon icon={
                        muted || !connected
                            ? faMicrophoneSlash
                            : faMicrophone
                    }/>
                </Button>
                <Button className={"btn btn-primary ml-1 mr-0 p-0"}
                        data-toggle={"tooltip"}
                        data-placement={"right"}
                        disabled={!connected}
                        onClick={() => this.props.videoconferenceDisconnectCallback()}
                        title={"Se déconnecter du canal audio actuel"}
                        type={"button"}>
                    <FontAwesomeIcon icon={faPhoneSlash}/>
                </Button>
            </>
        );
    }
}

export {PersonalVideoControls};
