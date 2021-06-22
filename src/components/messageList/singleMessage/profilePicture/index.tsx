import React from "react";

interface ProfilePictureProps {
    concatenate: boolean,
}

class ProfilePicture extends React.Component<ProfilePictureProps, {}> {
    public render(): React.ReactNode {
        return (
            <div className={"svg-align-container"}>
                <div className={"svg-align-center"}>
                    {this.props.concatenate
                        ? ""
                        : <img src={"/static/res/profile-picture-logo.svg"}
                               alt={"Utilisateur"}
                               width={"100%"}
                        />
                    }
                </div>
            </div>
        );
    }
}

export {ProfilePicture};
