import APIRequest from "common/APIRequest";
import storage from "common/storage";
import {sleep} from "common/utils";

import React from "react";
import {
    Form,
    Image
} from "react-bootstrap";

import Button from "react-bootstrap-button-loader";
import "./login.scss";

enum LoginStatus {
    SUCCESS = "success",
    FAILURE = "danger",
    NONE = "primary",
}

type LoginProps = {};

type LoginState = {
    username: string,
    password: string,
    remember: boolean,
    loading: boolean,
    status: LoginStatus,
}

export default class Login extends React.Component<LoginProps, LoginState> {
    public constructor(props: LoginProps) {
        super(props);
        this.state = {
            username: "",
            password: "",
            remember: false,
            loading: false,
            status: LoginStatus.NONE,
        }
    }

    public render(): React.ReactNode {
        return (
            <div className={"text-center"}>
                <main className={"login form-signin"}>
                    <Form onSubmit={(e) => this._handleSubmit(e)}>
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
                                    (e) => this.setState({
                                        username: e.target.value,
                                        status: LoginStatus.NONE,
                                    })
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
                                    (e) => this.setState({
                                        password: e.target.value,
                                        status: LoginStatus.NONE,
                                    })
                                }
                            />
                            <Form.Label>
                                Mot de passe
                            </Form.Label>
                        </Form.Group>
                        <Form.Group controlId={"remember"} className={"mb-2"}>
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
                            className={`w-100 btn btn-lg btn-${this.state.status}`}
                            type={"submit"}
                            disabled={!this._validForm()}
                            loading={this.state.loading}
                        >
                            Se connecter
                        </Button>
                        <div
                            className={`alert alert-${this.state.status} alert-dismissible fade show`}
                            role={"alert"}
                            hidden={this.state.status === LoginStatus.NONE}
                        >
                            <strong>{this.state.status === LoginStatus.SUCCESS ? "Succès" : "Échec"}</strong>
                            <button type="button"
                                    className="btn-close"
                                    data-bs-dismiss="alert"
                                    aria-label="Close"
                            />
                        </div>
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

        this.setState({loading: true});

        let success, resStatus, resData;

        await APIRequest
            .get("https://jsonplaceholder.typicode.com/todos/1")
            .onSuccess((status, data) => {
                success = true;
                resStatus = status;
                resData = data;
            })
            .onFailure((status, data, evt) => {
                success = false;
                resStatus = status;
                resData = data;
            })
            .minTime(500)
            .send();

        this.setState({loading: false});

        console.log(resStatus, resData);

        if (success) {
            this.setState({status: LoginStatus.SUCCESS});
            await sleep(1000);
        } else {
            this.setState({status: LoginStatus.FAILURE});
        }

        // this.state.username;


        storage.setItem("token", "my_token");
    }
}
