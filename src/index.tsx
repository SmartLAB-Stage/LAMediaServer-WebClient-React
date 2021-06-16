import dotenv from "dotenv";
import {library} from "@fortawesome/fontawesome-svg-core";
import {fab} from "@fortawesome/free-brands-svg-icons";
import {fas} from "@fortawesome/free-solid-svg-icons";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from "react-router-dom";
import {Routes} from "routes";
import "main.scss";

dotenv.config();

library.add(fab, fas);

ReactDOM.render((
    <Router>
        <Switch>
            <Route path="/" component={Routes}/>
        </Switch>
    </Router>
), document.getElementById("root"));
