import App from "app";
import React from "react";
import ReactDOM from "react-dom";

import {
    BrowserRouter as Router,
    Route,
    Switch
} from "react-router-dom";

ReactDOM.render((
    <Router>
        <Switch>
            <Route path="/" component={App}/>
        </Switch>
    </Router>
), document.getElementById("root"));
