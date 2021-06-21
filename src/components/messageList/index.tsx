import {APIRequest} from "common/APIRequest";
import {Message} from "model/message";
import React from "react";
import "./messageList.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
    Button,
    Modal,
} from "react-bootstrap";

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
    public constructor(props: MessageListProps) {
        super(props);

        this.state = {
            deletedMessage: null,
            deleteModalOpen: false,
            editedMessage: null,
        }
    }

    private _renderMessageList(): React.ReactNode[] {
        const messages: React.ReactNode[] = [];

        for (let i = 0; i < this.props.messages.length; ++i) {
            const message = this.props.messages[i];

            let profilePicture: React.ReactNode;
            let userInfos: React.ReactNode;

            let concatenate = false;

            if (i !== this.props.messages.length - 1) {
                const messageNext = this.props.messages[i + 1];
                if (messageNext.parentUser.id === message.parentUser.id) {
                    if (messageNext.timestamp.getTime() - message.timestamp.getTime() < 3 * 60 * 1000) {
                        concatenate = true;
                    }
                }
            }

            if (message.parentUser.isMe) {
                userInfos = (
                    <>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Button type={"button"}
                                className={"btn btn-warning btn-sm px-1 py-0"}
                                onClick={(e) => this._editMessage(e)}>
                            <FontAwesomeIcon icon={faEdit}/>
                        </Button>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Button type={"button"}
                                className={"btn btn-danger btn-sm px-1 py-0"}
                                onClick={() => this._openModalDeleteMessage(message)}>
                            <FontAwesomeIcon icon={faTrash}/>
                        </Button>
                    </>
                )
            } else {
                profilePicture = (
                    <div className={"svg-align-container"}>
                        <div className={"svg-align-center"}>
                            {concatenate
                                ? ""
                                : <img src={"/static/res/profile-picture-logo.svg"}
                                       alt={"Utilisateur"}
                                       width={"100%"}
                                />
                            }
                        </div>
                    </div>
                );

                userInfos = (
                    <>
                        <br/>
                        Par {message.parentUser.name}
                    </>
                );
            }

            let messageTimestamp: React.ReactNode = "";
            if (!concatenate) {
                messageTimestamp = (
                    <p className={"small text-muted"}>
                        Le {message.timestamp.toLocaleDateString()}, à {message.timestamp.toLocaleTimeString()}
                        {userInfos}
                    </p>
                );
            }

            messages.push(
                <div className={
                    "media " +
                    "w-50 " +
                    "mb-" + (concatenate ? "1" : "0") + " " +
                    (message.parentUser.isMe ? "ml-auto" : "")}
                >
                    {profilePicture}

                    <div className={"media-body " + (message.parentUser.isMe ? "ml-3" : "")}>
                        <div
                            className={"rounded py-2 px-3 mb-0 " + (message.parentUser.isMe ? "bg-accent-color" : "bg-light")}>
                            <p className={"text-small mb-0 " + (message.parentUser.isMe ? "text-white" : "text-muted")}>
                                {message.content}
                            </p>
                        </div>
                        {messageTimestamp}
                    </div>
                </div>
            );
        }

        return messages;
    }

    public render(): React.ReactNode {
        return (
            <div className={"message-list px-4 py-5 chat-box bg-white"}>
                {this._renderDeleteModal()}
                {this._renderMessageList()}
            </div>
        );
    }

    private _renderDeleteModal(): React.ReactNode {
        const handleClose = () => this.setState({
            deleteModalOpen: false,
            deletedMessage: null,
        });

        const handleDeleteMessage = () => {
            const deletedMessage = this.state.deletedMessage;
            this.setState({
                deleteModalOpen: false,
                deletedMessage: null,
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

    private _editMessage(e: any): void {

    }

    private _deleteMessage(message: Message): void {
        APIRequest
            .delete("/group/room/message/delete")
            .authenticate()
            .withPayload({
                roomId: this.props.roomId, // Ou `message.roomId` ?
                messageId: message.id,
            }).onSuccess((status, data) => {
                this.props.refreshMessages();
            }).send().then();
    }
}

export {MessageList};
