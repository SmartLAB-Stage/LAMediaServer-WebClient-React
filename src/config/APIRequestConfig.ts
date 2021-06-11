/**
 * Configuration
 */
export default abstract class APIRequestConfig {
    /**
     * Protocole
     */
    public static API_PROTOCOL = "http";

    /**
     * Site accédé
     */
    public static API_WEBSITE = "localhost";

    /**
     * Port accédé
     */
    public static API_PORT = "8080";

    /**
     * Préfixe des routes
     */
    public static API_ENDPOINT_PREFIX = "/api/v1/";
}
