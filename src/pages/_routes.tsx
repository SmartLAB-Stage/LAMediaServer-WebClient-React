import {PrivateRoute} from "pages/_privateRoute";
import {HomePage} from "pages/home";
import {LoginPage} from "pages/login";
import {LogoutPage} from "pages/logout";
import {NotFoundPage} from "pages/notFound";
import {RoomPage} from "pages/room";
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
                    <Route
                        exact={true}
                        path="/"
                        component={HomePage}/>
                    <Route
                        exact={true}
                        path="/login"
                        component={LoginPage}/>
                    <Route
                        exact={true}
                        path="/logout"
                        component={LogoutPage}/>
                    <PrivateRoute
                        exact={true}
                        path="/room/:id"
                        render={(props) =>
                            <RoomPage currentRoomId={props.match.params["id"] as string}
                                      fullURL={props.match.path}/>
                        }/>
                    <PrivateRoute
                        exact={true}
                        path="/home"
                        component={HomePage}/>
                    <Route
                        exact={true}
                        component={NotFoundPage}/>
                </Switch>
            </BrowserRouter>
        );
    }
}

// <Header appName="LAMediaServer"/>

export {Routes};
