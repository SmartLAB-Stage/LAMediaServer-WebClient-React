import {Message} from "model/message";
import React from "react";
import {UserInfos} from "./userInfos";

interface MessageTimestampProps {
    message: Message,
}

class MessageTimestamp extends React.Component<MessageTimestampProps, {}> {
    public render(): React.ReactNode {
        return (
            <p className={"small text-muted"}>
                Le {this.props.message.timestamp.toLocaleDateString()},
                à {this.props.message.timestamp.toLocaleTimeString()}

                {this.props.message.parentUser.isMe ? "" : <UserInfos message={this.props.message}/>}
            </p>
        );
    }
}

export {MessageTimestamp};
