import React from "react";
import "./home.scss";

interface HomeProps {}

interface HomeState {}

class Home extends React.Component<HomeProps, HomeState> {
    public render(): React.ReactNode {
        return <p>Home</p>;
    }
}

export {Home};
