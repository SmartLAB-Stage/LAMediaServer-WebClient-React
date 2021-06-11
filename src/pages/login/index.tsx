import APIRequest from "common/APIRequest";
import storage from "common/storage";
import React from "react";
import {
    Button,
    Form,
    Image
} from "react-bootstrap";
import "./login.scss";

type LoginProps = {};

type LoginState = {
    username: string,
    password: string,
    remember: boolean,
}

export default class Login extends React.Component<LoginProps, LoginState> {
    public constructor(props: LoginProps) {
        super(props);
        this.state = {
            username: "",
            password: "",
            remember: false,
        }
    }

    public render(): React.ReactNode {
        return (
            <div className={"text-center"}>
                <main className={"login form-signin"}>
                    <Form onSubmit={this._handleSubmit}>
                        <Image
                            className={"mb-4"}
                            src={"static/res/logo.png"}
                            alt={"Logo"}
                        />
                        <h1 className={"h3 mb-3 fw-normal"}>
                            Veuillez vous connecter
                        </h1>
                        <Form.Group controlId={"username"} className={"form-floating"}>
                            <Form.Control
                                autoFocus
                                name={"username"}
                                type={"text"}
                                placeholder={"username"}
                                defaultValue={this.state.username}
                                onChange={
                                    (e) => this.setState({username: e.target.value})
                                }
                            />
                            <Form.Label>
                                Nom d'utilisateur
                            </Form.Label>
                        </Form.Group>
                        <Form.Group controlId={"password"} className={"form-floating"}>
                            <Form.Control
                                type={"password"}
                                name={"password"}
                                placeholder={"password"}
                                defaultValue={this.state.password}
                                onChange={
                                    (e) => this.setState({password: e.target.value})
                                }
                            />
                            <Form.Label>
                                Mot de passe
                            </Form.Label>
                        </Form.Group>
                        <Form.Group controlId={"remember"} className={"mb-3"}>
                            <Form.Label>
                                <Form.Check
                                    type={"checkbox"}
                                    label={"Se souvenir de moi"}
                                    onChange={
                                        (e) => {
                                            this.setState({remember: e.target.checked})
                                        }
                                    }
                                />
                            </Form.Label>
                        </Form.Group>
                        <Button
                            className={"w-100 btn btn-lg btn-primary"}
                            type={"submit"}
                            disabled={!this._validForm()}
                        >
                            Se connecter
                        </Button>
                    </Form>
                </main>
            </div>
        );
    }

    private _validForm(): boolean {
        return this.state.username.length > 0 && this.state.password.length > 0;
    }

    private async _handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();

        await APIRequest
            .get("https://jsonplaceholder.typicode.com/todos/1")
            .onSuccess((status, data) => {
                console.log("complete");
                console.log(status, data);
            })
            .onFailure((status, data, evt) => {
                console.log("failure");
                console.log(status, data);
            })
            .send();

        console.log("end");

        // this.state.username;

        storage.setItem("token", "my_token");
    }
}
