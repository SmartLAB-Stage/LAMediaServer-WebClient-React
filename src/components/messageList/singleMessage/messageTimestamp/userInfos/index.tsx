import {Message} from "model/message";
import React from "react";

interface UserInfosProps {
    message: Message,
}

class UserInfos extends React.Component<UserInfosProps, {}> {
    public render(): React.ReactNode {
        return (
            <>
                <br/>
                Par {this.props.message.parentUser.name}
            </>
        );
    }
}

export {UserInfos};
