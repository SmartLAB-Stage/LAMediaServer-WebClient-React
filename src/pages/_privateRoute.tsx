import {Authentication} from "common/authentication";
import React from "react";
import {
    Redirect,
    Route,
    RouteProps,
} from "react-router-dom";

interface PrivateRouteProps extends RouteProps {
}

interface PrivateRouteState {
}

class PrivateRoute extends React.Component<PrivateRouteProps, PrivateRouteState> {
    public render(): React.ReactNode {
        return (
            <Route component={
                Authentication.isAuthenticated()
                    ? this.props.component
                    : () => <Redirect to={{pathname: '/login', state: {from: this.props.location}}}/>
                }>
            </Route>
        );
    }
}

export {PrivateRoute};
