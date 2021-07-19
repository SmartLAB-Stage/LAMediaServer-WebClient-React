interface RawRole {
    description: string,
    id: string,
    name: string,
    protected: boolean,
}

class Role {
    private readonly _description: string;
    private readonly _id: string;
    private readonly _name: string;
    private readonly _protection: boolean;

    private constructor(id: string,
                        description: string,
                        name: string,
                        protection: boolean,
    ) {
        this._id = id;
        this._description = description;
        this._name = name;
        this._protection = protection;
    }

    public get description(): string {
        return this._description;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get protection(): boolean {
        return this._protection;
    }

    public static fromObject(rawRole: RawRole): Role {
        return new this(
            rawRole.id,
            rawRole.description,
            rawRole.name,
            rawRole.protected,
        );
    }

    public static fromArray(rawRoles: RawRole[]): Role[] {
        const roles: Role[] = [];
        for (const rawRole of rawRoles) {
            roles.push(this.fromObject(rawRole));
        }
        return roles;
    }

    public toJSON(): Record<string, unknown> {
        return {
            description: this.description,
            id: this.id,
            name: this.name,
            protected: this.protection,
        };
    }
}

export {Role};
export type {RawRole};
