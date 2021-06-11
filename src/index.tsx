import "main.scss";
import React from "react";
import ReactDOM from "react-dom";

import {
    BrowserRouter as Router,
    Route,
    Switch
} from "react-router-dom";
import Routes from "routes";

ReactDOM.render((
    <Router>
        <Switch>
            <Route path="/" component={Routes}/>
        </Switch>
    </Router>
), document.getElementById("root"));
