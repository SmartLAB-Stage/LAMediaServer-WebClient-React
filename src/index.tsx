import {library} from "@fortawesome/fontawesome-svg-core";
import {fab} from "@fortawesome/free-brands-svg-icons";
import {fas} from "@fortawesome/free-solid-svg-icons";
import dotenv from "dotenv";
import "main.scss";
import {Routes} from "pages/_routes";
import ReactDOM from "react-dom";

dotenv.config();

library.add(fab, fas);

ReactDOM.render((
    <Routes/>
), document.getElementById("root"));
