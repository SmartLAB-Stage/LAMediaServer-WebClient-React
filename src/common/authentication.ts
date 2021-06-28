class Authentication {
    private static _storage: Storage = sessionStorage;

    public static isAuthenticated(): boolean {
        return this.getToken() !== null;
    }

    public static getToken(): string | null {
        return this._storage.getItem("_token");
    }

    public static setToken(token: string): void {
        this.clearToken();
        this._storage.setItem("_token", token);
    }

    public static clearToken(): void {
        localStorage.removeItem("_token");
        sessionStorage.removeItem("_token");
        this._storage.removeItem("_token");
    }
}

export {Authentication};
