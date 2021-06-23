import {User} from "model/user";
import React from "react";

interface PersonalInfosProps {
    user: User | null,
}

class PersonalInfos extends React.Component<PersonalInfosProps, {}> {
    public render(): React.ReactNode {
        return (
            <div className="card border-dark mb-3">
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
