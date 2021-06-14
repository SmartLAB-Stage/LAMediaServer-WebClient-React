import React from "react";
import "./messageList.scss";

interface MessageListProps {
}

interface MessageListState {
}

export default class MessageList extends React.Component<MessageListProps, MessageListState> {
    public render(): React.ReactNode {
        let messages: unknown[] = [];

        messages.push(
            <div className={"media w-50 mb-3"}>
                <div className={"svg-align-container"}>
                    <div className={"svg-align-center"}>
                        <img src={"/static/res/profile-picture-logo.svg"}
                             alt={"Utilisateur"}
                             width={"100%"}
                        />
                    </div>
                </div>
                <div className={"media-body ml-3"}>
                    <div className={"bg-light rounded py-2 px-3 mb-2"}>
                        <p className={"text-small mb-0 text-muted"}>
                            Test which is a new approach all
                            solutions
                        </p>
                    </div>
                    <p className={"small text-muted"}>
                        12:00 PM | Aug 13
                    </p>
                </div>
            </div>
        );

        messages.push(
            <div className={"media w-50 ml-auto mb-3"}>
                <div className={"media-body"}>
                    <div className={"bg-accent-color rounded py-2 px-3 mb-2"}>
                        <p className={"text-small mb-0 text-white"}>
                            Test which is a new approach to have
                            all
                            solutions
                        </p>
                    </div>
                    <p className={"small text-muted"}>
                        12:00 PM | Aug 13
                    </p>
                </div>
            </div>
        );

        messages.push(
            <div className={"media w-50 mb-3"}>
                <div className={"svg-align-container"}>
                    <div className={"svg-align-center"}>
                        <img src={"/static/res/profile-picture-logo.svg"}
                             alt={"Utilisateur"}
                             width={"100%"}
                        />
                    </div>
                </div>
                <div className={"media-body ml-3"}>
                    <div className={"bg-light rounded py-2 px-3 mb-2"}>
                        <p className={"text-small mb-0 text-muted"}>
                            Test, which is a new approach to have
                        </p>
                    </div>
                    <p className={"small text-muted"}>
                        12:00 PM | Aug 13
                    </p>
                </div>
            </div>
        );

        for (let i = 0; i < 20; ++i) {
            messages.push(
                <div className={"media w-50 ml-auto mb-3"}>
                    <div className={"media-body"}>
                        <div className={"bg-accent-color rounded py-2 px-3 mb-2"}>
                            <p className={"text-small mb-0 text-white"}>
                                Test which is a new approach to have
                                all
                                solutions
                            </p>
                        </div>
                        <p className={"small text-muted"}>
                            12:00 PM | Aug 13
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
