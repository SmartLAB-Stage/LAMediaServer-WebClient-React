/**
 * Configuration
 */
abstract class APIRequestConfig {
    /**
     * Protocole
     */
    public static API_PROTOCOL: string = "http";

    /**
     * Site accédé
     */
    public static API_WEBSITE: string = "localhost";

    /**
     * Port accédé
     */
    public static API_PORT: string = "8080";

    /**
     * Préfixe des routes
     */
    public static API_ENDPOINT_PREFIX: string = "/api/v1/";
}

export {APIRequestConfig};
