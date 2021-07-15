import {
    faEdit,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {Button} from "react-bootstrap";
import "./actionButtons.scss";

interface ActionButtonsProps {
    editMessage: (evt: React.MouseEvent<HTMLElement, MouseEvent>) => void,
    openModalDeleteMessage: () => void,
}

class ActionButtons extends React.Component<ActionButtonsProps, {}> {
    public render(): React.ReactNode {
        return (
            <div className={"action-buttons"}>
                &nbsp;
                <Button className={"btn btn-secondary btn-sm px-1 py-0"}
                        data-placement={"top"}
                        data-toggle={"tooltip"}
                        onClick={(evt: React.MouseEvent<HTMLElement, MouseEvent>) => this.props.editMessage(evt)}
                        title={"Modifier ce message"}
                        type={"button"}>
                    <FontAwesomeIcon icon={faEdit}/>
                </Button>
                &nbsp;
                <Button className={"btn btn-danger btn-sm px-1 py-0"}
                        data-placement={"top"}
                        data-toggle={"tooltip"}
                        onClick={() => this.props.openModalDeleteMessage()}
                        title={"Supprimer ce message"}
                        type={"button"}>
                    <FontAwesomeIcon icon={faTrash}/>
                </Button>
            </div>
        );
    }
}

export {ActionButtons};
