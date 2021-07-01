import {PrivateRoute} from "pages/_privateRoute";
import {LoginPage} from "pages/login";
import {LogoutPage} from "pages/logout";
import {NotFoundPage} from "pages/notFound";
import {OAuthUserProfilePage} from "pages/oauth/userprofile";
import {RoomPage} from "pages/room";
import React from "react";
import {
    BrowserRouter,
    Route,
    Switch,
} from "react-router-dom";

class Routes extends React.Component<{}, {}> {
    public render(): React.ReactNode {
        return (
            <BrowserRouter>
                <Switch>
                    <PrivateRoute
                        exact={true}
                        path="/"
                        render={() =>
                            <RoomPage currentRoomId={null}
                                      fullURL={"/room/:id"}/>
                        }/>
                    <Route
                        exact={true}
                        path="/oauth/userprofile"
                        component={OAuthUserProfilePage}/>
                    <Route
                        exact={true}
                        path="/logout"
                        component={LogoutPage}/>
                    <Route
                        exact={true}
                        path="/login"
                        component={LoginPage}/>
                    <PrivateRoute
                        exact={true}
                        path="/room"
                        render={() =>
                            <RoomPage currentRoomId={null}
                                      fullURL={"/room/:id"}/>
                        }/>
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
                        render={() =>
                            <RoomPage currentRoomId={null}
                                      fullURL={"/room/:id"}/>
                        }/>
                    <Route
                        exact={true}
                        component={NotFoundPage}/>
                </Switch>
            </BrowserRouter>
        );
    }
}

export {Routes};
