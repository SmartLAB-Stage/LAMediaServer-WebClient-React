import React from "react";
import {
    BrowserRouter,
    Route,
    Switch
} from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";

export default class Routes extends React.Component {
    render() {
        return (
            <div>
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/login" component={Login}/>
                        <Route exact path="/home" component={Home}/>
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
}

// <Header appName="LAMediaServer"/>
