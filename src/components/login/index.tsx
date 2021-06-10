import React from "react";
import {
    Button,
    Form
} from "react-bootstrap";
import storage from "storage";
import "./login.scss";

type LoginProps = {};

export default class Login extends React.Component<LoginProps> {
    public constructor(props: LoginProps) {
        super(props);
        this.state = {
            username: ""
        }
    }

    private _remember: string = "";

    public get remember(): string {
        return this._remember;
    }

    public set remember(value: string) {
        this._remember = value;
    }

    private _username: string = "";

    public get username(): string {
        return this._username;
    }

    public set username(value: string) {
        this._username = value;
    }

    private _password: string = "";

    public get password(): string {
        return this._password;
    }

    public set password(value: string) {
        this._password = value;
    }

    public render(): React.ReactNode {
        return (
            <main className={"login"}>
                <div className={"form-signin"}>
                    <Form onSubmit={this._handleSubmit}>
                        <Form.Group controlId={"username"} className={"form-floating"}>
                            <Form.Label>
                                Nom d'utilisateur
                            </Form.Label>
                            <Form.Control
                                autoFocus
                                name={"username"}
                                type={"text"}
                                placeholder={"username"}
                                value={this.username}
                                onChange={(e) => this.username = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group controlId={"password"} className={"form-floating"}>
                            <Form.Label>
                                Mot de passe
                            </Form.Label>
                            <Form.Control
                                type={"password"}
                                name={"password"}
                                placeholder={"password"}
                                value={this.password}
                                onChange={(e) => this.password = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group controlId={"remember"} className={"checkbox mb-3"}>
                            <Form.Label>
                                Se souvenir de moi
                            </Form.Label>
                            <Form.Switch
                                type={"checkbox"}
                                name={"remember"}
                                placeholder={"password"}
                                value={"Se souvenir de moi"}
                                onChange={(e) => this.remember = e.target.value}
                            />
                        </Form.Group>
                        <Button
                            block
                            size={"lg"}
                            type={"submit"}
                            disabled={!this._validForm()}
                        >
                            Se connecter
                        </Button>
                    </Form>
                </div>
            </main>
        );
    }

    private _validForm() {
        return this.username.length > 0 && this.password.length > 0;
    }

    private _handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log(e);
        storage.setItem("token", "my_token");
    }
}
