import {PrivateRoute} from "pages/_privateRoute";
import {Home} from "pages/home";
import {Login} from "pages/login";
import {Logout} from "pages/logout";
import {NotFound} from "pages/notFound";
import React from "react";
import {
    BrowserRouter,
    Route,
    Switch,
} from "react-router-dom";

interface RoutesProps {
}

interface RoutesState {
}

class Routes extends React.Component<RoutesProps, RoutesState> {
    public constructor(props: RoutesProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route exact path="/login" component={Login}/>
                    <Route exact path="/logout" component={Logout}/>
                    <PrivateRoute exact path="/home" component={Home}/>
                    <Route component={NotFound}/>
                </Switch>
            </BrowserRouter>
        );
    }
}

// <Header appName="LAMediaServer"/>

export {Routes};
