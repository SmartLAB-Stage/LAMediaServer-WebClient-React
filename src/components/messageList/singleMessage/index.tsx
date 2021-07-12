import {ProfilePicture} from "components/profilePicture";
import {Message} from "model/message";
import React from "react";
import {ActionButtons} from "./actionButtons";
import {MessageTimestamp} from "./messageTimestamp";
import "./singleMessage.scss";

interface SingleMessageProps {
    concatenate: boolean,
    editMessage: (evt: any) => void,
    message: Message,
    openModalDeleteMessage: () => void,
}

class SingleMessage extends React.Component<SingleMessageProps, {}> {
    public render(): React.ReactNode {
        return (
            <div key={this.props.message.id}
                 className={
                     "media " +
                     "w-50 " +
                     "mb-" + (this.props.concatenate ? "1" : "0") + " " +
                     (this.props.message.parentUser.isMe ? "ml-auto" : null)
                 }
            >
                {this.props.message.parentUser.isMe
                    ? null
                    : (
                        <div className={"svg-align-container"}>
                            <div className={"svg-align-center"}>
                                {this.props.concatenate
                                    ? null
                                    : <ProfilePicture user={this.props.message.parentUser}/>
                                }
                            </div>
                        </div>
                    )
                }

                <div className={
                    "media-body " +
                    (this.props.message.parentUser.isMe ? "ml-3" : null)
                }>
                    <div className={
                        "rounded " +
                        "py-2 " +
                        "px-3 " +
                        "mb-0 " +
                        (this.props.message.parentUser.isMe ? "bg-accent-color" : "bg-light") + " "
                    }>
                        <p className={
                            "message " +
                            "text-small " +
                            "mb-0 " +
                            (this.props.message.parentUser.isMe ? "text-white" : "text-muted") + " "
                        }>
                            {this.props.message.content}
                        </p>
                    </div>

                    {
                        this.props.concatenate
                            ? null
                            : <MessageTimestamp message={this.props.message}/>
                    }
                </div>
                {
                    this.props.message.parentUser.isMe
                        ? <ActionButtons editMessage={(evt) => this.props.editMessage(evt)}
                                         openModalDeleteMessage={() => this.props.openModalDeleteMessage()}/>
                        : null
                }
            </div>
        );
    }
}

export {SingleMessage};
