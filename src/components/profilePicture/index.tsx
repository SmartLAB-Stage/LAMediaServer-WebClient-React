import {APIRequest} from "helper/APIRequest";
import {User} from "model/user";
import React from "react";

interface ProfilePictureProps {
    flex?: boolean,
    onClick?: () => void | null,
    user: User | null,
}

class ProfilePicture extends React.Component<ProfilePictureProps, {}> {
    public render(): React.ReactNode {
        let url = "";
        if (this.props.user !== null) {
            url = APIRequest.getFullRoute(`/user/avatar/get?username=${this.props.user.username}`);
        }

        const img = (
            <img className={"profile-picture align-self-center " + (this.props.flex === false ? null : "d-flex")}
                 src={url}
                 onClick={() =>
                     this.props.onClick
                         ? this.props.onClick()
                         : void null
                 }
                 onError={(elt) => {
                     // @ts-ignore
                     const img: HTMLImageElement = elt.target;
                     img.src = "/static/res/profile-picture-logo.svg";
                     img.onerror = null;
                 }}
                 width={"100%"}
                 alt="Utilisateur"/>
        );

        if (this.props.onClick) {
            return (
                <button type={"button"} className={"btn btn-link"}>
                    {img}
                </button>
            );
        } else {
            return img;
        }
    }
}

export {ProfilePicture};
