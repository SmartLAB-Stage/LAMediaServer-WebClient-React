import Routes from "routes";
import React from "react";
import ReactDOM from "react-dom";
import "bootstrap.scss";
import "main.scss";

import {
    BrowserRouter as Router,
    Route,
    Switch
} from "react-router-dom";

ReactDOM.render((
    <Router>
        <Switch>
            <Route path="/" component={Routes}/>
        </Switch>
    </Router>
), document.getElementById("root"));
