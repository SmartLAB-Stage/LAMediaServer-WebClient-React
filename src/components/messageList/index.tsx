import {APIRequest} from "common/APIRequest";
import {SingleMessage} from "components/messageList/singleMessage";
import {Message} from "model/message";
import React from "react";
import {
    Button,
    Modal,
} from "react-bootstrap";
import "./messageList.scss";

interface MessageListProps {
    messages: Message[],
    refreshMessages: Function,
    roomId: string,
}

interface MessageListState {
    deletedMessage: Message | null,
    deleteModalOpen: boolean,
    editedMessage: Message | null,
}

class MessageList extends React.Component<MessageListProps, MessageListState> {
    private static _currentUpdateVersion = NaN;
    private _currentUpdateVersion = NaN;

    public constructor(props: MessageListProps) {
        super(props);

        this.state = {
            deletedMessage: null,
            deleteModalOpen: false,
            editedMessage: null,
        }
    }

    public render(): React.ReactNode {
        return (
            <>
                {this._renderDeleteModal()}
                {this._renderMessageList()}
            </>
        );
    }

    public componentDidMount(): void {
        MessageList._currentUpdateVersion = Math.random();
        this._currentUpdateVersion = MessageList._currentUpdateVersion;
    }

    public componentDidUpdate(): void {
        const list = document.querySelector("div.message-list");
        if (list !== null) {
            // FIXME: Va toujours scroller
            // list.scrollTop = list.scrollHeight;
        }
    }

    public componentWillUnmount(): void {
        MessageList._currentUpdateVersion = Math.random();
    }

    private _renderMessageList(): React.ReactNode[] {
        const messages: React.ReactNode[] = [];

        for (let i = 0; i < this.props.messages.length; ++i) {
            const message = this.props.messages[i];
            let concatenate = false;

            if (i !== this.props.messages.length - 1) {
                const messageNext = this.props.messages[i + 1];
                if (messageNext.parentUser.id === message.parentUser.id) {
                    if (messageNext.timestamp.getTime() - message.timestamp.getTime() < 3 * 60 * 1000) {
                        concatenate = true;
                    }
                }
            }

            messages.push(
                <SingleMessage message={message}
                               concatenate={concatenate}
                               editMessage={(evt) => this._editMessage(evt)}
                               openModalDeleteMessage={() => this._openModalDeleteMessage(message)}
                />
            );
        }

        return messages;
    }

    private _renderDeleteModal(): React.ReactNode {
        const handleClose = () => this.setState({
            deletedMessage: null,
            deleteModalOpen: false,
        });

        const handleDeleteMessage = () => {
            const deletedMessage = this.state.deletedMessage;
            this.setState({
                deletedMessage: null,
                deleteModalOpen: false,
            });

            if (deletedMessage !== null) {
                this._deleteMessage(deletedMessage);
            }
        }

        return (
            <>
                <Modal show={this.state.deleteModalOpen} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Supprimer ce message</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Voulez-vous vraiment supprimer ce message ?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Annuler
                        </Button>
                        <Button variant="primary" onClick={handleDeleteMessage}>
                            Confirmer
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

    private _openModalDeleteMessage(message: Message): void {
        this.setState({
            deletedMessage: message,
            deleteModalOpen: true,
        });
    }

    private _editMessage(evt: any): void {

    }

    private _deleteMessage(message: Message): void {
        APIRequest
            .delete("/group/room/message/delete")
            .authenticate()
            .canceledWhen(() => this._currentUpdateVersion !== MessageList._currentUpdateVersion)
            .withPayload({
                messageId: message.id,
                roomId: this.props.roomId, // Ou `message.roomId` ?
            })
            .onSuccess(() => {
                this.props.refreshMessages();
            })
            .send()
            .then();
    }
}

export {MessageList};
