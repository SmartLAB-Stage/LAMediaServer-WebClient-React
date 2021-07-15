import {faPhoneAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

interface CallButtonProps {
    selected: boolean,
    videoConferenceChangeCallback: () => void,
}

class CallButton extends React.Component<CallButtonProps, {}> {
    public render(): React.ReactNode {
        return (
            <button type={"button"}
                    className={
                        "list-group-item " +
                        "list-group-item-action " +
                        (this.props.selected ? "list-group-item-info " : null)
                    }
                    onClick={(e) => {
                        e.stopPropagation();
                        this.props.videoConferenceChangeCallback();
                    }}>
                <FontAwesomeIcon icon={faPhoneAlt}/>
            </button>
        );
    }
}

export {CallButton};
