import {ConfirmationModal} from "components/shared/confirmationModal";
import {APIRequest} from "helper/APIRequest";
import {APIWebSocket} from "helper/APIWebSocket";
import {
    Message,
    RawMessage,
} from "model/message";
import React from "react";
import "./messageList.scss";
import {SingleMessage} from "./singleMessage";

interface MessageListProps {
    roomId: string,
}

interface MessageListState {
    deleteModalOpen: boolean,
    messages: Message[],
    selectedMessageToDelete: Message | null,
    selectedMessageToEdit: Message | null,
}

class MessageList extends React.Component<MessageListProps, MessageListState> {
    private static _currentUpdateVersion = NaN;
    private _active: boolean;
    private _alreadyScrolledDown: boolean;
    private readonly _sockets: APIWebSocket[];

    public constructor(props: MessageListProps) {
        super(props);

        this._active = false;

        this._alreadyScrolledDown = false;
        this._sockets = [];

        this.state = {
            selectedMessageToDelete: null,
            deleteModalOpen: false,
            selectedMessageToEdit: null,
            messages: [],
        };
    }

    public render(): React.ReactNode {
        return (
            <>
                <ConfirmationModal body={"Voulez-vous vraiment supprimer ce message ?"}
                                   modalClosedCallback={() => this.setState({
                                       selectedMessageToDelete: null,
                                       deleteModalOpen: false,
                                   })}
                                   modalActionCallback={() => this._deleteMessage()}
                                   open={this.state.deleteModalOpen}
                                   title={"Supprimer ce message"}/>
                {this._renderMessageList()}
            </>
        );
    }

    public componentDidMount(): void {
        this._active = true;

        this._getAllMessages();

        this._setSocketMessagesSent();
        this._setSocketMessagesDeleted();
        this._setSocketMessagesEdited();

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

    private _deleteMessage(): void {
        if (this.state.selectedMessageToDelete !== null) {
            APIRequest
                .delete("/group/room/message/delete")
                .authenticate()
                .canceledWhen(() => !this._active)
                .withPayload({
                    messageId: this.state.selectedMessageToDelete.id,
                    roomId: this.props.roomId, // Ou `message.roomId` ?
                })
                .send()
                .then();
        }

        this.setState({
            selectedMessageToDelete: null,
            deleteModalOpen: false,
        });
    }

    private _getAllMessages() {
        APIRequest
            .get("/group/room/message/list")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                roomId: this.props.roomId,
            })
            .onSuccess((payload) => {
                const messages: Message[] = [];

                for (const message of payload.messages as RawMessage[]) {
                    messages.unshift(Message.fromObject(message));
                }

                this.setState({
                    messages,
                });
            })
            .send()
            .then();
    }

    private _setSocketMessagesSent() {
        this._sockets.push(APIWebSocket
            .getSocket("/group/room/message/sent")
            .withToken()
            .withPayload({
                roomId: this.props.roomId,
            })
            .onResponse((data: unknown) => {
                this.setState({
                    messages: [
                        ...this.state.messages,
                        Message.fromObject(data as RawMessage),
                    ],
                });
            }),
        );
    }

    private _setSocketMessagesDeleted() {
        this._sockets.push(APIWebSocket
            .getSocket("/group/room/message/deleted")
            .withToken()
            .withPayload({
                roomId: this.props.roomId,
            })
            .onResponse((data: unknown) => {
                const messages = this.state.messages;
                const deletedMessage = data as { id: string };

                for (let i = messages.length - 1; i >= 0; --i) {
                    if (messages[i].id === deletedMessage.id) {
                        messages.splice(i, 1);
                        break;
                    }
                }

                this.setState({
                    messages,
                });
            }),
        );
    }

    private _setSocketMessagesEdited() {
        interface EditedMessage {
            editor: {
                timestamp: Date,
                user: {
                    id: string,
                    username: string,
                },
            }
            message: RawMessage,
        }

        this._sockets.push(APIWebSocket
            .getSocket("/group/room/message/edited")
            .withToken()
            .withPayload({
                roomId: this.props.roomId,
            })
            .onResponse((data: unknown) => {
                const messages = this.state.messages;
                const editedMessage = data as EditedMessage;

                for (let i = 0; i < messages.length; ++i) {
                    if (messages[i].id === editedMessage.message.id) {
                        messages[i] = Message.fromObject(editedMessage.message);
                        break;
                    }
                }

                this.setState({
                    messages,
                });
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
                               editMessage={(evt) => void null} /* TODO: Gérer cet event */
                               openModalDeleteMessage={() => this.setState({
                                   selectedMessageToDelete: message,
                                   deleteModalOpen: true,
                               })}
                />,
            );
        }

        return messages;
    }
}

export {MessageList};
