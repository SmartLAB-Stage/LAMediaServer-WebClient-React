import React from "react";

class LoginPage extends React.Component<{}, {}> {
    public render(): React.ReactNode {
        window.location.href = "/";
        return null;
    }
}

export {LoginPage};
