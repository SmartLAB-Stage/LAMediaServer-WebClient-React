import React from "react";
import {
    Button,
    Modal,
} from "react-bootstrap";

interface DeleteModalProps {
    closeModalAction: () => void,
    deleteMessageAction: () => void,
    deleteModalOpen: boolean,
}

class DeleteModal extends React.Component<DeleteModalProps, {}> {
    public render(): React.ReactNode {
        return (
            <Modal show={this.props.deleteModalOpen} onHide={this.props.closeModalAction}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>Supprimer ce message</Modal.Title>
                </Modal.Header>
                <Modal.Body>Voulez-vous vraiment supprimer ce message ?</Modal.Body>
                <Modal.Footer>
                    <Button variant={"secondary"} onClick={this.props.closeModalAction}>
                        Annuler
                    </Button>
                    <Button variant={"primary"} onClick={this.props.deleteMessageAction}>
                        Confirmer
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export {DeleteModal};
