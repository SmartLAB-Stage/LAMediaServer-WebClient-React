import Header from "components/header";
import Home from "components/home";
import Login from "components/login";
import React from "react";
import {
    Route,
    Switch
} from "react-router-dom";

class App extends React.Component {
    render() {
        return (
            <div>
                <Header appName="LAMediaServer"/>
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route path="/login" component={Login}/>
                </Switch>
            </div>
        );
    }
}

export default App;
