import {SingleMessage} from "components/messageList/singleMessage";
import {APIRequest} from "helper/APIRequest";
import {APIWebSocket} from "helper/APIWebSocket";
import {Message} from "model/message";
import React from "react";
import {
    Button,
    Modal,
} from "react-bootstrap";
import "./messageList.scss";

interface MessageListProps {
    roomId: string,
}

interface MessageListState {
    deletedMessage: Message | null,
    deleteModalOpen: boolean,
    editedMessage: Message | null,
    messages: Message[],
}

class MessageList extends React.Component<MessageListProps, MessageListState> {
    private static _currentUpdateVersion = NaN;
    private _active: boolean;
    private _alreadyScrolledDown: boolean;
    private _currentUpdateVersion: number;
    private readonly _sockets: APIWebSocket[];

    public constructor(props: MessageListProps) {
        super(props);

        this._active = false;

        this._alreadyScrolledDown = false;
        this._currentUpdateVersion = NaN;
        this._sockets = [];

        this.state = {
            deletedMessage: null,
            deleteModalOpen: false,
            editedMessage: null,
            messages: [],
        };
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
        this._active = true;

        MessageList._currentUpdateVersion = Math.random();
        this._currentUpdateVersion = MessageList._currentUpdateVersion;

        this._getAllMessages();

        this._setSocketSentMessages();
        this._setSocketDeletedMessages();

        for (const sock of this._sockets) {
            sock.open();
        }
    }

    public componentDidUpdate(): void {
        if (!this._alreadyScrolledDown) {
            const list = document.querySelector("div.message-list");
            if (list !== null) {
                this._alreadyScrolledDown = true;
                list.scrollTop = list.scrollHeight;
            }
        }
    }

    public componentWillUnmount(): void {
        MessageList._currentUpdateVersion = Math.random();
        for (const sock of this._sockets) {
            sock.close();
        }

        this._active = false;
    }

    private _getAllMessages() {
        APIRequest
            .get("/group/room/message/list")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                roomId: this.props.roomId,
            })
            .onSuccess((status, data) => {
                const messages: Message[] = [];

                for (const message of data.payload) {
                    messages.unshift(Message.fromFullMessage(message));
                }

                this.setState({
                    messages,
                });
            })
            .send()
            .then();
    }

    private _setSocketSentMessages() {
        this._sockets.push(APIWebSocket
            .getSocket("/group/room/message/sent")
            .withToken()
            .withPayload({
                roomId: this.props.roomId,
            })
            .onResponse((data) => {
                const messages = this.state.messages;

                for (const message of data) {
                    messages.push(Message.fromFullMessage(message));
                }

                this.setState({
                    messages,
                });
            }),
        );
    }

    private _setSocketDeletedMessages() {
        this._sockets.push(APIWebSocket
            .getSocket("/group/room/message/deleted")
            .withToken()
            .withPayload({
                roomId: this.props.roomId,
            })
            .onResponse((data: { id: string }[]) => {
                const messages = this.state.messages;

                for (const deletedMessage of data) {
                    for (let i = messages.length - 1; i >= 0; --i) {
                        if (messages[i].id === deletedMessage.id) {
                            messages.splice(i, 1);
                            break;
                        }
                    }
                }

                this.setState({
                    messages,
                })
            }),
        );
    }

    private _renderMessageList(): React.ReactNode[] {
        const messages: React.ReactNode[] = [];

        for (let i = 0; i < this.state.messages.length; ++i) {
            const message = this.state.messages[i];
            let concatenate = false;

            if (i !== this.state.messages.length - 1) {
                const messageNext = this.state.messages[i + 1];
                if (messageNext.parentUser.id === message.parentUser.id) {
                    if (messageNext.timestamp.getTime() - message.timestamp.getTime() < 3 * 60 * 1000) {
                        concatenate = true;
                    }
                }
            }

            messages.push(
                <SingleMessage key={message.id}
                               message={message}
                               concatenate={concatenate}
                               editMessage={(evt) => this._editMessage(evt)}
                               openModalDeleteMessage={() => this._openModalDeleteMessage(message)}
                />,
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
        };

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
            .send()
            .then();
    }
}

export {MessageList};
