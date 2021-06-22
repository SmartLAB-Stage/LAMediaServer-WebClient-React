import {
    faEdit,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {Button} from "react-bootstrap";
import "./actionButtons.scss";

interface ActionButtonsProps {
    editMessage: (evt: any) => void,
    openModalDeleteMessage: () => void,
}

class ActionButtons extends React.Component<ActionButtonsProps, {}> {
    public render(): React.ReactNode {
        return (
            <div className={"actionButtons"}>
                &nbsp;
                <Button type={"button"}
                        className={"btn btn-secondary btn-sm px-1 py-0"}
                        onClick={(evt) => this.props.editMessage(evt)}>
                    <FontAwesomeIcon icon={faEdit}/>
                </Button>
                &nbsp;
                <Button type={"button"}
                        className={"btn btn-danger btn-sm px-1 py-0"}
                        onClick={() => this.props.openModalDeleteMessage()}>
                    <FontAwesomeIcon icon={faTrash}/>
                </Button>
            </div>
        );
    }
}

export {ActionButtons};
