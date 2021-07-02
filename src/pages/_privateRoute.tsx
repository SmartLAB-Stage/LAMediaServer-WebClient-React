import {Authentication} from "helper/authentication";
import {OAuth} from "helper/OAuth";
import React from "react";
import {
    Route,
    RouteProps,
} from "react-router-dom";

class PrivateRoute extends React.Component<RouteProps, {}> {
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
