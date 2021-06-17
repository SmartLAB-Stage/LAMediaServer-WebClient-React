/**
 * Attend un certain temps
 * @param ms Temps en ms
 */
const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export {
    sleep,
};
