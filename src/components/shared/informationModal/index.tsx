import React from "react";
import {
    Button,
    Modal,
} from "react-bootstrap";

interface InformationModalProps {
    body: React.ReactNode,
    modalClosedCallback: () => void,
    open: boolean,
    title: React.ReactNode,
}

class InformationModal extends React.Component<InformationModalProps, {}> {
    public render(): React.ReactNode {
        return (
            <Modal show={this.props.open}
                   onHide={() => {
                       this.props.modalClosedCallback();
                   }}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{this.props.body}</Modal.Body>
                <Modal.Footer>
                    <Button variant={"secondary"} onClick={() => {
                        this.props.modalClosedCallback();
                    }}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export {InformationModal};
