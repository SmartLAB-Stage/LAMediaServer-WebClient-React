import React from "react";
import {
    BrowserRouter,
    Route,
    Switch
} from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Rooms from "./pages/rooms";

export default class Routes extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route exact path="/login" component={Login}/>
                    <Route exact path="/home" component={Home}/>
                    <Route exact path="/rooms" component={Rooms}/>
                </Switch>
            </BrowserRouter>
        );
    }
}

// <Header appName="LAMediaServer"/>
