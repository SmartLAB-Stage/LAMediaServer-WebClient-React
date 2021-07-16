import React from "react";
import {
    Button,
    Modal,
} from "react-bootstrap";

interface ConfirmationModalProps {
    body: React.ReactNode,
    modalActionCallback: () => void,
    modalClosedCallback: () => void,
    open: boolean,
    title: React.ReactNode,
}

class ConfirmationModal extends React.Component<ConfirmationModalProps, {}> {
    public render(): React.ReactNode {
        return (
            <Modal show={this.props.open} onHide={() => this.props.modalClosedCallback}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{this.props.body}</Modal.Body>
                <Modal.Footer>
                    <Button variant={"secondary"} onClick={() => this.props.modalClosedCallback}>
                        Annuler
                    </Button>
                    <Button variant={"primary"} onClick={() => {
                        this.props.modalActionCallback();
                        this.props.modalClosedCallback();
                    }}>
                        Confirmer
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export {ConfirmationModal};
