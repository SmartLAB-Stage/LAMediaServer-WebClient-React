/**
 * Canal
 */
import {
    Message,
    RawMessage,
} from "./message";

/**
 * Canal raw
 */
interface RawChannel {
    id: string,
    isDefault: boolean,
    lastMessage: RawMessage,
    messagesCount: number,
    name: string,
    parentRoomId: string,
    usersCount: number,
}

/**
 * Canal
 */
class Channel {
    /**
     * ID
     * @private
     */
    private readonly _id: string;

    /**
     * Canal par défaut ou non
     * @private
     */
    private readonly _isDefault: boolean;

    /**
     * Dernier message
     * @private
     */
    private readonly _lastMessage: Message | null;

    private readonly _messagesCount: number;

    /**
     * Nom
     * @private
     */
    private readonly _name: string;

    private readonly _parentRoomId: string;

    private readonly _usersCount: number;

    /**
     * Constructeur
     * @param id ID
     * @param name Nom
     * @param defaultRoom Canal par défaut ou non
     * @param lastMessage Dernier message
     * @param parentRoomId ID de la room parente
     * @param usersCount Nombre d'utilisateurs
     * @param messagesCount Nombre de messages
     */
    public constructor(id: string,
                       name: string,
                       defaultRoom: boolean,
                       lastMessage: Message | null,
                       parentRoomId: string,
                       usersCount: number,
                       messagesCount: number,
    ) {
        this._id = id;
        this._name = name;
        this._isDefault = defaultRoom;
        this._lastMessage = lastMessage;
        this._parentRoomId = parentRoomId;
        this._usersCount = usersCount;
        this._messagesCount = messagesCount;
    }

    public get id(): string {
        return this._id;
    }

    public get isDefault(): boolean {
        return this._isDefault;
    }

    public get lastMessage(): Message | null {
        return this._lastMessage;
    }

    public get messagesCount(): number {
        return this._messagesCount;
    }

    public get name(): string {
        return this._name;
    }

    public get parentRoomId(): string {
        return this._parentRoomId;
    }

    public get usersCount(): number {
        return this._usersCount;
    }

    public static fromObject(obj: RawChannel): Channel {
        return new this(
            obj.id,
            obj.name,
            obj.isDefault,
            obj.lastMessage ? Message.fromObject(obj.lastMessage) : null,
            obj.parentRoomId,
            obj.usersCount,
            obj.messagesCount,
        );
    }

    /**
     * Permet l'encodage en JSON
     */
    public toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            isDefault: this.isDefault,
            lastMessage: this.lastMessage,
            messagesCount: this.messagesCount,
            usersCount: this.usersCount,
            parentRoomId: this.parentRoomId,
        };
    }
}

export {Channel};
export type {RawChannel};
