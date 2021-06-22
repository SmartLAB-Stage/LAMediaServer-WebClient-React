import {Message} from "model/message";
import React from "react";
import {ActionButtons} from "./actionButtons";
import {MessageTimestamp} from "./messageTimestamp";
import {ProfilePicture} from "./profilePicture";
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
                     (this.props.message.parentUser.isMe ? "ml-auto" : "")
                 }
            >
                {this.props.message.parentUser.isMe ? "" : <ProfilePicture concatenate={this.props.concatenate}/>}

                <div className={
                    "media-body " +
                    "" + (this.props.message.parentUser.isMe ? "ml-3" : "") + " "
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
                            ? ""
                            : <MessageTimestamp message={this.props.message}/>
                    }
                </div>
                {
                    this.props.message.parentUser.isMe
                        ? <ActionButtons editMessage={(evt) => this.props.editMessage(evt)}
                                         openModalDeleteMessage={() => this.props.openModalDeleteMessage()}/>
                        : ""
                }
            </div>
        );
    }
}

export {SingleMessage};