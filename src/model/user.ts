import {Presence} from "model/presence";
import {Role} from "model/role";

interface RawUser {
    id: string,
    isMe: boolean,
    name: string,
    roles: Role[] | null,
    status: Presence,
    statusMessage: string | null,
    username: string,
}

/**
 * Utilisateur
 */
class User {
    /**
     * ID
     * @protected
     */
    protected readonly _id: string;

    protected readonly _isMe: boolean;

    /**
     * Nom complet
     * @protected
     */
    protected readonly _name: string;

    protected readonly _roles: Role[] | null;
    /**
     * Nom d'utilisateur
     * @protected
     */
    protected readonly _username: string;

    protected constructor(id: string,
                          username: string,
                          name: string,
                          isMe: boolean,
                          roles: Role[] | null,
                          status: Presence,
    ) {
        this._id = id;
        this._username = username;
        this._name = name;
        this._isMe = isMe;
        this._roles = roles;
        this._status = status;
    }

    /**
     * Statut
     * @protected
     */
    protected _status: Presence;

    public get status(): Presence {
        return this._status;
    }

    public get id(): string {
        return this._id;
    }

    public get isMe(): boolean {
        return this._isMe;
    }

    public get name(): string {
        return this._name;
    }

    public get roles(): Role[] | null {
        return this._roles;
    }

    public get username(): string {
        return this._username;
    }

    public static fromObject(rawUser: RawUser): User {
        return new this(
            rawUser.id,
            rawUser.username,
            rawUser.name,
            rawUser.isMe,
            rawUser.roles,
            rawUser.status as Presence,
        );
    }

    public setStatus(newStatus: Presence): void {
        this._status = newStatus;
    }

    /**
     * Permet l'encodage en JSON
     */
    public toJSON(): object {
        return {
            id: this.id,
            isMe: this.isMe,
            name: this.name,
            roles: this.roles,
            status: this.status,
            username: this.username,
        };
    }
}

export {User};
export type {RawUser};
