import React from "react";
import {Link} from "react-router-dom";

type HeaderProps = {
    appName: string
}

export default class Header extends React.Component<HeaderProps> {
    public render(): React.ReactNode {
        return (
            <nav className="navbar">
                <div className="container">
                    <Link to="/">
                        Retour à {this.props.appName}
                    </Link>
                </div>
            </nav>
        );
    }
}
