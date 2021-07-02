import {APIRequest} from "helper/APIRequest";
import {User} from "model/user";
import React from "react";

interface ProfilePictureProps {
    user: User | null,
}

class ProfilePicture extends React.Component<ProfilePictureProps, {}> {
    public render(): React.ReactNode {
        let url = "";
        if (this.props.user !== null) {
            url = APIRequest.getFullRoute(`/user/avatar/get?username=${this.props.user.username}`);
        }

        return (
            <img className="profile-picture d-flex align-self-center"
                 src={url}
                 onError={(elt) => {
                     // @ts-ignore
                     const img: HTMLImageElement = elt.target;
                     img.src = "/static/res/profile-picture-logo.svg";
                     img.onerror = null;
                 }}
                 width={"100%"}
                 alt="Utilisateur"/>
        );
    }
}

export {ProfilePicture};
