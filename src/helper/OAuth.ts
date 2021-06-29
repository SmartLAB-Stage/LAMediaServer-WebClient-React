import ClientOAuth2 from "client-oauth2";

abstract class OAuth {
    private static _client: ClientOAuth2 | null = null;

    public static getClient(clientState: string | null = null): ClientOAuth2 {
        let state: string;
        if (clientState === null) {
            state = this._getRandomState();
        } else {
            state = clientState;
        }

        if (OAuth._client === null) {
            OAuth._client = new ClientOAuth2({
                clientId: process.env.REACT_APP_OAUTH_CLIENT_ID,
                clientSecret: process.env.REACT_APP_OAUTH_CLIENT_SECRET,
                accessTokenUri: process.env.REACT_APP_OAUTH_ACCESS_TOKEN_URI,
                authorizationUri: process.env.REACT_APP_OAUTH_AUTHORIZATION_URI,
                redirectUri: window.location.origin + "/oauth/userprofile",
                state,
                scopes: [
                    process.env.REACT_APP_OAUTH_SCOPE as string,
                ],
            });
        }

        return OAuth._client;
    }

    public static getUri(): string {
        return this.getClient().code.getUri();
    }

    public static getToken(location: string, state: string): Promise<ClientOAuth2.Token> {
        return this.getClient(state).code.getToken(location);
    }

    private static _getRandomState(): string {
        return (Math.floor(Math.random() * Math.pow(2, 32))).toString();
    }
}

export {OAuth};
