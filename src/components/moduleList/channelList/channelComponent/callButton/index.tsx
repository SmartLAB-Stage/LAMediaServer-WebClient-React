import {faPhoneAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {VideoconferenceType} from "model/videoconference";
import React from "react";
import {Button} from "react-bootstrap";

interface CallButtonProps {
    selected: boolean,
    videoConferenceChangeCallback: (videoType: VideoconferenceType) => void,
}

class CallButton extends React.Component<CallButtonProps, {}> {
    public render(): React.ReactNode {
        return (
            <Button type={"button"}
                    className={
                        "list-group-item " +
                        "list-group-item-action " +
                        "btn-warning " +
                        "btn-outline-warning " +
                        (this.props.selected ? "active " : null)
                    }
                    onClick={(e) => {
                        e.stopPropagation();
                        this.props.videoConferenceChangeCallback(VideoconferenceType.SCREEN_SHARE);
                    }}>
                <FontAwesomeIcon icon={faPhoneAlt}/>
            </Button>
        );
    }
}

export {CallButton};
