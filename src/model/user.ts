/**
 * Statut de connexion
 */
enum UserStatus {
    AWAY = "away",
    OFFLINE = "offline",
    ONLINE = "online",
    UNKNOWN = "unknown",
}

interface RawPartialUser {
    id: string,
    isMe: boolean,
    name: string,
    username: string,
}

interface RawFullUser extends RawPartialUser {
    status: UserStatus | string,
}

/**
 * Utilisateur
 */
class User {
    /**
     * ID
     * @private
     */
    private readonly _id: string;

    private readonly _isMe: boolean;

    /**
     * Dernière activité
     * @private
     */
    private readonly _lastSeen: Date | undefined;

    /**
     * Nom complet
     * @private
     */
    private readonly _name: string;

    /**
     * Statut
     * @private
     */
    private readonly _status: UserStatus | undefined;

    /**
     * Nom d'utilisateur
     * @private
     */
    private readonly _username: string;

    private constructor(id: string,
                        isMe: boolean,
                        username: string,
                        name: string,
                        status: UserStatus | undefined = undefined,
                        lastSeen: Date | undefined = undefined,
    ) {
        this._id = id;
        this._isMe = isMe;
        this._username = username;
        this._name = name;
        this._status = status;
        this._lastSeen = lastSeen;
    }

    public get id(): string {
        return this._id;
    }

    public get isMe(): boolean {
        return this._isMe;
    }

    public get lastSeen(): Date | undefined {
        return this._lastSeen;
    }

    public get name(): string {
        return this._name;
    }

    public get status(): UserStatus | undefined {
        return this._status;
    }

    public get username(): string {
        return this._username;
    }

    public static fromPartialUser(id: string, isMe: boolean, username: string, name: string | undefined): User {
        if (name === undefined) {
            return new this(id, isMe, username, username);
        } else {
            return new this(id, isMe, username, name);
        }
    }

    public static fromFullUser(rawUser: RawFullUser): User {
        return new this(
            rawUser.id,
            rawUser.isMe,
            rawUser.username,
            rawUser.name,
            rawUser.status as UserStatus,
        );
    }

    /**
     * Permet l'encodage en JSON
     */
    public toJSON(): object {
        return {
            id: this.id,
            isMe: this.isMe,
            lastSeen: this.lastSeen,
            name: this.name,
            status: this.status,
            username: this.username,
        };
    }
}

export {
    User,
    UserStatus,
};
export type {RawPartialUser};
