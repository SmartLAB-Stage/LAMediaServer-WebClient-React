type RawModule = {
    createdAt: Date,
    id: string,
    name: string,
    roomId: string,
    roomsCount: number,
    updatedAt: Date,
    usersCount: number,
};

class Module {
    private readonly _createdAt: Date;
    private readonly _id: string;
    private readonly _name: string;
    private readonly _roomId: string;
    private readonly _roomsCount: number;
    private readonly _updatedAt: Date;
    private readonly _usersCount: number;

    private constructor(id: string,
                        name: string,
                        createdAt: Date,
                        updatedAt: Date,
                        roomId: string,
                        roomsCount: number,
                        usersCount: number,
    ) {
        this._id = id;
        this._name = name;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._roomId = roomId;
        this._roomsCount = roomsCount;
        this._usersCount = usersCount;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }

    public get roomId(): string {
        return this._roomId;
    }

    public get roomsCount(): number {
        return this._roomsCount;
    }

    public get usersCount(): number {
        return this._usersCount;
    }

    public static fromObject(obj: RawModule): Module {
        return new this(
            obj.id,
            obj.name,
            obj.createdAt,
            obj.updatedAt,
            obj.roomId,
            obj.roomsCount,
            obj.usersCount,
        );
    }

    public toJSON(): object {
        return {
            createdAt: this.createdAt,
            id: this.id,
            name: this.name,
            roomId: this.roomId,
            roomsCount: this.roomsCount,
            updatedAt: this.updatedAt,
            usersCount: this.usersCount,
        };
    }
}

export {Module};
export type {RawModule};
