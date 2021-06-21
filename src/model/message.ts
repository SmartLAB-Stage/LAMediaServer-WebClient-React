import {Attachment} from "./attachement";
import {Reaction} from "./reaction";
import {
    RawUser,
    User,
} from "./user";

/**
 * Message raw
 */
interface RawMessage {
    content: string,
    id: string,
    parentUser: RawUser,
    roomId: string,
    timestamp: Date,
}

/**
 * Message
 */
class Message {
    /**
     * Liste des pièces jointes
     * @private
     */
    private readonly _attachments: Attachment[] | undefined;

    /**
     * Contenu
     * @private
     */
    private readonly _content: string;

    /**
     * ID
     * @private
     */
    private readonly _id: string;

    /**
     * Utilisateur parent
     * @private
     */
    private readonly _parentUser: User;

    /**
     * Liste des réactions
     * @private
     */
    private readonly _reactions: Reaction[] | undefined;

    /**
     * ID de la salle
     * @private
     */
    private readonly _roomId: string | undefined;

    /**
     * Timestamp
     * @private
     */
    private readonly _timestamp: Date;

    private constructor(id: string,
                        content: string,
                        parentUser: User,
                        roomId: string | undefined,
                        timestamp: Date,
                        attachments: Attachment[] | undefined,
                        reactions: Reaction[] | undefined,
    ) {
        this._id = id;
        this._content = content;
        this._parentUser = parentUser;
        this._roomId = roomId;
        this._timestamp = timestamp;
        this._attachments = attachments;
        this._reactions = reactions;
    }

    public get attachments(): Attachment[] | undefined {
        return this._attachments;
    }

    public get content(): string {
        return this._content;
    }

    public get id(): string {
        return this._id;
    }

    public get parentUser(): User {
        return this._parentUser;
    }

    public get reactions(): Reaction[] | undefined {
        return this._reactions;
    }

    public get roomId(): string | undefined {
        return this._roomId;
    }

    public get timestamp(): Date {
        return this._timestamp;
    }

    /**
     * Depuis un room complet
     * @param rawMessage Message
     */
    public static fromFullMessage(rawMessage: RawMessage): Message {
        return new this(
            rawMessage.id,
            rawMessage.content,
            User.fromPartialUser(
                rawMessage.parentUser.id,
                rawMessage.parentUser.isMe,
                rawMessage.parentUser.username,
                rawMessage.parentUser.name,
            ),
            rawMessage.roomId,
            new Date(rawMessage.timestamp),
            undefined,
            undefined,
        );
    }

    public toJSON(): object {
        return {
            attachments: this.attachments,
            content: this.content,
            id: this.id,
            parentUser: this.parentUser,
            reactions: this.reactions,
            roomId: this.roomId,
            timestamp: this.timestamp,
        };
    }
}

export {Message};
export type {RawMessage};
