import {Authentication} from "helper/authentication";
import {OAuth} from "helper/OAuth";
import React from "react";
import {
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
            <Route
                {...this.props}
                component={
                    Authentication.isAuthenticated()
                        ? this.props.component
                        : () => {
                            window.location.href = OAuth.getUri();
                            return null;
                        }
                }
            />
        );
    }
}

export {PrivateRoute};
