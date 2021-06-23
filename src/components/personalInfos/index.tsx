import {ProfilePicture} from "components/profilePicture";
import {User} from "model/user";
import React from "react";
import "./personalInfos.scss";

interface PersonalInfosProps {
    user: User | null,
}

class PersonalInfos extends React.Component<PersonalInfosProps, {}> {
    public render(): React.ReactNode {
        return (
            <div className="card border-secondary mb-0 flex-row flex-wrap">
                <div className="card-header border-0">
                    <ProfilePicture user={this.props.user}/>
                </div>
                <div className="card-body text-dark">
                    <p className="card-text">
                        {this.props.user === null
                            ? <i>En cours de rafraichissement...</i>
                            : this.props.user.name
                        }
                    </p>
                </div>
            </div>
        );
    }
}

export {PersonalInfos};
