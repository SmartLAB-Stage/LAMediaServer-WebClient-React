import React from "react";
import {
    Route,
    Switch
} from "react-router-dom";
import Header from "./components/header";
import Home from "./pages/home";
import Login from "./pages/login";

export default class Routes extends React.Component {
    render() {
        return (
            <div>
                <Header appName="LAMediaServer"/>
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route exact path="/login" component={Login}/>
                </Switch>
            </div>
        );
    }
}
