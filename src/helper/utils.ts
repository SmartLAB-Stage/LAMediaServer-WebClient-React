/**
 * Configure le payload des requêtes GET
 * @param route Route de base
 * @param payload Payload
 */
function setGetPayload(route: string, payload: object): string {
    const keys = Object.keys(payload);
    if (keys.length === 0) {
        return route;
    } else {
        let newRoute = route + "?";

        for (const key of keys) {
            newRoute += `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}&`;
        }

        return newRoute.slice(0, -1);
    }
}

/**
 * Attend un certain temps
 * @param ms Temps en ms
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export {
    setGetPayload,
    sleep,
};
