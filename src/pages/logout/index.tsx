import {Authentication} from "common/authentication";
import React from "react";

class Logout extends React.Component {
    public render(): React.ReactNode {
        Authentication.clearToken();
        return "Déconnecté";
    }
}

export {Logout};
