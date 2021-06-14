import APIRequest from "common/APIRequest";
import storage from "common/storage";
import {sleep} from "common/utils";

import React from "react";
import {
    Form,
    Image
} from "react-bootstrap";
import Button from "react-bootstrap-button-loader";

import {RouteComponentProps} from "react-router-dom";
import "./login.scss";

/**
 * Statut du login
 */
enum LoginStatus {
    SUCCESS = "success",
    FAILURE = "danger",
    NONE = "primary",
}

/**
 * Props
 */
interface LoginProps extends RouteComponentProps {
}

/**
 * État
 */
interface LoginState {
    /**
     * Nom d'utilisateur
     */
    username: string,

    /**
     * Mot de passe
     */
    password: string,

    /**
     * Case "rester connecté"
     */
    remember: boolean,

    /**
     * En train de charger ou non
     */
    loading: boolean,

    /**
     * Statut de la connexion
     */
    status: LoginStatus,

    /**
     * Message d'erreur
     */
    errorMessage: string,
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
            errorMessage: "",
        };
    }

    public render(): React.ReactNode {
        return (
            <main className={"text-center login"}>
                <Form className={"form-signin"} onSubmit={(e) => this._handleSubmit(e)}>
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
                            placeholder={"Nom d'utilisateur"}
                            defaultValue={this.state.username}
                            onChange={
                                (e) => this.setState({
                                    username: e.target.value,
                                    status: LoginStatus.NONE,
                                })
                            }
                        />
                        <Form.Label
                            className={"sr-only"}>
                            Nom d'utilisateur
                        </Form.Label>
                    </Form.Group>
                    <Form.Group controlId={"password"} className={"form-floating"}>
                        <Form.Control
                            type={"password"}
                            name={"password"}
                            placeholder={"Mot de passe"}
                            defaultValue={this.state.password}
                            onChange={
                                (e) => this.setState({
                                    password: e.target.value,
                                    status: LoginStatus.NONE,
                                })
                            }
                        />
                        <Form.Label
                            className={"sr-only"}>
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
                    >{
                        this.state.status === LoginStatus.SUCCESS ? (
                            <strong>Succès</strong>
                        ) : (
                            <div>
                                <strong>Échec de la connexion</strong>
                                <br/>
                                <span>{this.state.errorMessage}</span>
                            </div>
                        )
                    }</div>
                </Form>
            </main>
        );
    }

    /**
     * Édite le CSS.
     * Impossible de changer les propriétés du body sans le changer sur toutes les pages, d'où cette fonction
     */
    componentWillMount(): void {
        document.body.style.display = "flex";
        document.body.style.alignItems = "center";
        document.body.style.justifyContent = "center";
    }

    componentWillUnmount(): void {
        /*
        document.body.style.display = null;
        document.body.style.alignItems = null;
        document.body.style.justifyContent = null;
         */
    }

    /**
     * Form valide ou non
     * @private
     */
    private _validForm(): boolean {
        return this.state.username.length > 0 && this.state.password.length > 0;
    }

    /**
     * Soumission
     * @param e Event
     * @private
     */
    private async _handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();

        this.setState({loading: true});

        let success, resData;

        await APIRequest
            .post("/me/login")
            .withPayload({
                username: this.state.username,
                password: this.state.password,
            })
            .onSuccess((status, data) => {
                success = true;
                resData = data;
            })
            .onFailure((status, data, _evt) => {
                success = false;
                resData = data;
            })
            .minTime(500)
            .send();

        this.setState({loading: false});

        let message = "Une erreur est survenue.";
        if (resData !== null) {
            message = resData.message;
        }

        this.setState({errorMessage: message});

        if (success) {
            this.setState({status: LoginStatus.SUCCESS});
            storage.setItem("_token", resData.payload.token);
            await sleep(1000);
            this.props.history.push("/home");
        } else {
            this.setState({status: LoginStatus.FAILURE});
        }
    }
}
