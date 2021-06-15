import React from "react";
import {
    BrowserRouter,
    Route,
    Switch,
} from "react-router-dom";
import {Login} from "pages/login";
import {Home} from "pages/home";

class Routes extends React.Component {
    public render(): React.ReactNode {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route exact path="/login" component={Login}/>
                    <Route exact path="/home" component={Home}/>
                </Switch>
            </BrowserRouter>
        );
    }
}

// <Header appName="LAMediaServer"/>

export {Routes};
