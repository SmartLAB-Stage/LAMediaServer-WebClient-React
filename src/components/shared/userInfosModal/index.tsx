import {PresenceBadge} from "components/shared/presenceBadge";
import {ProfilePicture} from "components/shared/profilePicture";
import {CurrentUser} from "model/currentUser";
import {User} from "model/user";
import React from "react";
import {
    Button,
    Modal,
} from "react-bootstrap";
import "./userInfosModal.scss";

interface OtherUserInfosModalProps {
    user: User | CurrentUser,
    closeModalAction: () => void,
    modalOpen: boolean,
}

class UserInfosModal extends React.Component<OtherUserInfosModalProps, {}> {
    public render(): React.ReactNode {
        let roles: string | null = null;

        if (this.props.user.roles !== null) {
            roles = "";

            for (const role of this.props.user.roles) {
                roles += role.name + ", ";
            }

            roles = roles.slice(0, -2);
        }

        return (
            <Modal className={"user-infos-modal"}
                   show={this.props.modalOpen}
                   onHide={this.props.closeModalAction}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <ProfilePicture flex={false} user={this.props.user}/>
                        {
                            this.props.user instanceof CurrentUser
                                ? "Informations personnelles"
                                : "Informations de l'utilisateur"
                        }
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className={"table"}>
                        <tbody>
                            <tr>
                                <th scope={"row"}>Nom</th>
                                <td>{this.props.user.name}</td>
                            </tr>
                            <tr>
                                <th scope={"row"}>Nom d'utilisateur</th>
                                <td>{this.props.user.username}</td>
                            </tr>
                            {
                                this.props.user instanceof CurrentUser
                                    ? (
                                        <tr>
                                            <th scope={"row"}>Adresse mail</th>
                                            <td>{this.props.user.email}</td>
                                        </tr>
                                    ) : null
                            }
                            <tr>
                                <th scope={"row"}>Statut</th>
                                <td>
                                    <PresenceBadge presence={this.props.user.status}/>
                                </td>
                            </tr>
                            <tr>
                                <th scope={"row"}>Rôles</th>
                                <td>{
                                    roles !== null
                                        ? roles
                                        : <i>Inconnus</i>
                                }</td>
                            </tr>
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={"primary"} onClick={this.props.closeModalAction}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export {UserInfosModal};
