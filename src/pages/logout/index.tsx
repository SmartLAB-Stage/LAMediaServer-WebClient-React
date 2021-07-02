import {Authentication} from "helper/authentication";
import React from "react";

class LogoutPage extends React.Component<{}, {}> {
    public render(): React.ReactNode {
        Authentication.clearToken();
        return "Déconnecté";
    }
}

export {LogoutPage};
