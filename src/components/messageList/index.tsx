import {Message} from "model/message";
import React from "react";
import "./messageList.scss";

interface MessageListProps {
    messages: Message[],
}

interface MessageListState {
}

class MessageList extends React.Component<MessageListProps, MessageListState> {
    public render(): React.ReactNode {
        const messages: React.ReactNode[] = [];

        for (let message of this.props.messages) {
            let profilePicture, userInfos;

            if (!message.parentUser.isMe) {
                profilePicture = (
                    <div className={"svg-align-container"}>
                        <div className={"svg-align-center"}>
                            <img src={"/static/res/profile-picture-logo.svg"}
                                 alt={"Utilisateur"}
                                 width={"100%"}
                            />
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

            messages.push(
                <div className={"media w-50 mb-3 " + (message.parentUser.isMe ? "ml-auto" : "")}>
                    {profilePicture}

                    <div className={"media-body " + (message.parentUser.isMe ? "ml-3" : "")}>
                        <div
                            className={"rounded py-2 px-3 mb-2 " + (message.parentUser.isMe ? "bg-accent-color" : "bg-light")}>
                            <p className={"text-small mb-0 " + (message.parentUser.isMe ? "text-white" : "text-muted")}>
                                {message.content}
                            </p>
                        </div>
                        <p className={"small text-muted"}>
                            Le {message.timestamp === undefined ? "?" : message.timestamp.toLocaleDateString()}
                            , à {message.timestamp === undefined ? "?" : message.timestamp.toLocaleTimeString()}
                            {userInfos}
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className={"message-list px-4 py-5 chat-box bg-white"}>
                {messages}
            </div>
        );
    }
}

export {MessageList};
