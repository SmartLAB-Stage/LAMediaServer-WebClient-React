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
    channelId: string,
}

interface MessageListState {
    messages: Message[],
    selectedMessageToDelete: Message | null,
    selectedMessageToEdit: Message | null,
}

class MessageList extends React.Component<MessageListProps, MessageListState> {
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
                                   })}
                                   modalActionCallback={() => this._deleteMessage()}
                                   open={this.state.selectedMessageToDelete !== null}
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
        for (const sock of this._sockets) {
            sock.close();
        }

        this._active = false;
    }

    private _deleteMessage(): void {
        if (this.state.selectedMessageToDelete !== null) {
            APIRequest
                .delete("/module/channel/message/delete")
                .authenticate()
                .canceledWhen(() => !this._active)
                .withPayload({
                    messageId: this.state.selectedMessageToDelete.id,
                    channelId: this.props.channelId, // Ou `message.channelId` ?
                })
                .send()
                .then();
        }
    }

    private _getAllMessages() {
        APIRequest
            .get("/module/channel/message/list")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                channelId: this.props.channelId,
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
            .onFailure((status) => {
                if (status === 404) {
                    window.location.replace("/channel");
                }
            })
            .send()
            .then();
    }

    private _setSocketMessagesSent() {
        this._sockets.push(APIWebSocket
            .getSocket("/module/channel/message/sent")
            .withToken()
            .withPayload({
                channelId: this.props.channelId,
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
            .getSocket("/module/channel/message/deleted")
            .withToken()
            .withPayload({
                channelId: this.props.channelId,
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
            .getSocket("/module/channel/message/edited")
            .withToken()
            .withPayload({
                channelId: this.props.channelId,
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
                               })}
                />,
            );
        }

        return messages;
    }
}

export {MessageList};
