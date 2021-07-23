import ClientOAuth2 from "client-oauth2";
import {APIRequest} from "helper/APIRequest";
import {Authentication} from "helper/authentication";
import {OAuth} from "helper/OAuth";
import React from "react";
import {
    Redirect,
    RouteProps,
} from "react-router-dom";

interface OAuthUserProfilePageState {
    connected: boolean,
    errorMessage: string | null,
}

class OAuthUserProfilePage extends React.Component<RouteProps, OAuthUserProfilePageState> {
    private _active = false;

    public constructor(props: RouteProps) {
        super(props);
        this.state = {
            connected: false,
            errorMessage: null,
        };
    }

    public componentDidMount() {
        this._active = true;

        const params = new URLSearchParams(this.props.location?.search);

        OAuth.getToken(window.location.href, params.get("state") as string).then(
            async (token) => {
                this._sendOAuthTokenToAPI(token);
            },
        ).catch((e) => {
            console.debug("Erreur lors de l'authentification:", e.message);
            this.setState({
                errorMessage: e.message,
            });
        });
    }

    public componentWillUnmount() {
        this._active = false;
    }

    public render(): React.ReactNode {
        if (this.state.connected) {
            return <Redirect to={{pathname: "/"}}/>;
        } else {
            if (this.state.errorMessage === null) {
                return "Connexion en cours...";
            } else {
                return `Une erreur s'est produite : '${this.state.errorMessage}'.`;
            }
        }
    }

    private _sendOAuthTokenToAPI(token: ClientOAuth2.Token) {
        APIRequest
            .post("/me/login")
            .withPayload({
                accessToken: token.accessToken,
                expiresIn: token.data.expires_in,
                refreshToken: token.refreshToken,
            })
            .canceledWhen(() => !this._active)
            .unauthorizedErrorsAllowed()
            .onSuccess((payload) => {
                if (!this._active || payload === null || Array.isArray(payload)) {
                    return;
                }

                Authentication.setInfos(payload.userId as string, payload.token as string);
                this.setState({
                    connected: true,
                });
            })
            .onFailure((status, data) => {
                this.setState({
                    errorMessage: data === null ? "(inconnu)" : data.message,
                });
            })
            .send()
            .then();
    }
}

export {OAuthUserProfilePage};
