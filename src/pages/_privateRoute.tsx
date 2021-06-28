import {APIRequest} from "common/APIRequest";
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
            <Route
                {...this.props}
                component={
                    Authentication.isAuthenticated()
                        ? this.props.component
                        : () => {
                            if (this.props.location !== undefined && /\?token=.+/.test(this.props.location.search)) {
                                let token = this.props.location.search;
                                token = decodeURIComponent(token.replace(/\?token=(.+)/, "$1"));
                                Authentication.setToken(token);
                                return <Redirect to={{pathname: "/home"}}/>;
                            } else {
                                window.location.href = APIRequest.getRawRoute("/oauth/login?service=" + encodeURIComponent(window.location.href));
                                return null;
                            }
                        }
                }
            />
        );
    }
}

export {PrivateRoute};
