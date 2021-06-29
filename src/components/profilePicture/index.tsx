import {APIRequest} from "helper/APIRequest";
import {User} from "model/user";
import React from "react";

interface ProfilePictureProps {
    user: User | null,
}

class ProfilePicture extends React.Component<ProfilePictureProps, {}> {
    /**
     * Non utilisé, proof of concept si besoin
     */
    public renderRaw(): React.ReactNode {
        const image = `
            <svg xmlns="http://www.w3.org/2000/svg" 
                 viewBox="0 0 200 200">
                <rect width="100%"
                      height="100%"
                      fill="#8BC34A"/>
                <text x="50%"
                      y="50%"
                      dy="0.36em"
                      text-anchor="middle" 
                      pointer-events="none"
                      fill="#ffffff"
                      font-family="'Helvetica', 'Arial', 'Lucida Grande', 'sans-serif'"
                      font-size="125">
                    R
                </text>
            </svg>
        `;

        return (
            <img className="profilePicture d-flex align-self-center"
                 src={`data:image/svg+xml;utf8,${encodeURIComponent(image)}`}
                 srcSet={"/static/res/profile-picture-logo.svg"}
                 width={"100%"}
                 alt="Utilisateur"/>
        );
    }

    public render(): React.ReactNode {
        let url = "";
        if (this.props.user !== null) {
            url = APIRequest.getFullRoute(`/user/avatar/get?username=${this.props.user.username}`);
        }

        return (
            <img className="profilePicture d-flex align-self-center"
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
