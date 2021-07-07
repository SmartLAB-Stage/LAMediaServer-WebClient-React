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
                <Button className={"btn btn-primary m-1 p-2"}
                        disabled={!connected}
                        onClick={() => void null}
                        type={"button"}>
                    <FontAwesomeIcon icon={
                        muted || !connected
                            ? faMicrophoneSlash
                            : faMicrophone
                    }/>
                </Button>
                <Button className={"btn btn-primary m-1 p-2"}
                        disabled={!connected}
                        onClick={() => this.props.videoconferenceDisconnectCallback()}
                        type={"button"}>
                    <FontAwesomeIcon icon={faPhoneSlash}/>
                </Button>
            </>
        );
    }
}

export {PersonalVideoControls};
