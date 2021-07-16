class Authentication {
    private static _storage: Storage = localStorage;

    public static isAuthenticated(): boolean {
        return this.getToken() !== null && this.getUserId() !== null;
    }

    public static getToken(): string | null {
        return this._storage.getItem("token");
    }

    public static getUserId(): string | null {
        return this._storage.getItem("userId");
    }

    public static setInfos(userId: string, token: string): void {
        this.clearInfos();
        this._storage.setItem("userId", userId);
        this._storage.setItem("token", token);
    }

    public static clearInfos(): void {
        for (const key of ["token", "userId"]) {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
            this._storage.removeItem(key);
        }
    }
}

export {Authentication};
