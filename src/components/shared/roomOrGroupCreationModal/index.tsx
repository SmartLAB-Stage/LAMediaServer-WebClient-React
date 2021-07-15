import {PresenceBadge} from "components/shared/presenceBadge";
import {User} from "model/user";
import React from "react";
import {
    Button,
    Modal,
} from "react-bootstrap";

interface RoomOrGroupCreationModalProps {
    closeModalAction: () => void,
    createAction: (name: string, memberIds: string[]) => void,
    isRoom: boolean,
    modalOpen: boolean,
    users: User[],
}

class RoomOrGroupCreationModal extends React.Component<RoomOrGroupCreationModalProps, {}> {
    private _checkAll: boolean;
    private readonly _idPrefix: string;
    private readonly _inputRefs: Record<string, React.RefObject<HTMLInputElement>>;
    private readonly _mainInputRef: React.RefObject<HTMLInputElement>;
    private readonly _nameInputRef: React.RefObject<HTMLInputElement>;

    constructor(props: RoomOrGroupCreationModalProps) {
        super(props);
        this._idPrefix = "room-creation-form-user-" + String(Math.floor(Math.random() * Math.pow(10, 8)));
        this._inputRefs = {};
        this._checkAll = true;
        this._mainInputRef = React.createRef();
        this._nameInputRef = React.createRef();
    }

    public render(): React.ReactNode {
        const checkboxes: JSX.Element[] = [];

        for (const user of this.props.users) {
            const key = `${this._idPrefix}-${user.id}`;
            const id = `${key}-${Math.floor(Math.random() * Math.pow(10, 8))}`;
            this._inputRefs[user.id] = React.createRef();
            checkboxes.push(
                <div key={key} className={"form-check"}>
                    <input className={"form-check-input"}
                           defaultChecked={user.isMe}
                           disabled={user.isMe}
                           id={id}
                           onClick={() => this._childInputClicked()}
                           ref={this._inputRefs[user.id]}
                           type={"checkbox"}/>
                    <label className={"form-check-label"} htmlFor={id}>
                        <div className={"d-flex justify-content-between bd-highlight mb-0"}>
                            <div className="pr-2 bd-highlight">
                                {user.name}
                                {
                                    user.isMe
                                        ? <span>&nbsp;<i>(vous)</i></span>
                                        : null
                                }
                            </div>
                            <div className={"pl-1 bd-highlight"}>
                                <PresenceBadge presence={user.status}/>
                            </div>
                        </div>
                    </label>
                </div>,
            );
        }

        return (
            <Modal className={"user-infos-modal"}
                   show={this.props.modalOpen}
                   onHide={this.props.closeModalAction}>
                <form>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>
                            Création d'un nouveau {this.props.isRoom ? "salon" : "groupe"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className={"mb-3 form-check"}>
                            <input className={"form-check-input"}
                                   defaultValue={""}
                                   id={`${this._idPrefix}-name`}
                                   placeholder={`Nom du ${this.props.isRoom ? "salon" : "groupe"}`}
                                   ref={this._nameInputRef}
                                   type={"text"}/>
                            <label className={"form-check-label"} htmlFor={`${this._idPrefix}-name`}>
                                Nom du {this.props.isRoom ? "salon" : "groupe"}
                            </label>
                        </div>
                        <div className={"mb-3 form-check"}>
                            <input className={"form-check-input"}
                                   id={`${this._idPrefix}-selectAll`}
                                   onClick={() => this._enableOrDisableAll()}
                                   ref={this._mainInputRef}
                                   type={"checkbox"}/>
                            <label className={"form-check-label"} htmlFor={`${this._idPrefix}-selectAll`}>
                                Tous les utilisateurs
                            </label>
                        </div>
                        {checkboxes}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={"secondary"} onClick={() => this.props.closeModalAction()}>
                            Annuler
                        </Button>
                        <Button type={"submit"}
                                variant={"primary"}
                                onClick={(e: React.MouseEvent<HTMLElement>) => {
                                    e.preventDefault();
                                    this._triggerCreation();
                                    this.props.closeModalAction();
                                }}>
                            Confirmer
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }

    private _enableOrDisableAll(): void {
        for (const key of Object.keys(this._inputRefs)) {
            const ref = this._inputRefs[key];
            if (ref.current !== null && !ref.current.disabled) {
                ref.current.checked = this._checkAll;
            }
        }

        if (this._mainInputRef.current !== null) {
            this._mainInputRef.current.checked = this._checkAll;
            this._mainInputRef.current.indeterminate = false;
        }

        this._checkAll = !this._checkAll;
    }

    private _childInputClicked(): void {
        let allChecked = true;
        let allUnchecked = true;

        for (const key of Object.keys(this._inputRefs)) {
            const ref = this._inputRefs[key];
            if (ref.current !== null && !ref.current.disabled) {
                if (ref.current.checked) {
                    allUnchecked = false;
                } else {
                    allChecked = false;
                }
            }
        }

        if (this._mainInputRef.current !== null) {
            this._mainInputRef.current.checked = allChecked && !allUnchecked;
            this._mainInputRef.current.indeterminate = allChecked === allUnchecked;
        }
    }

    private _triggerCreation() {
        const ids: string[] = [];
        for (const key of Object.keys(this._inputRefs)) {
            const ref = this._inputRefs[key];
            if (ref.current !== null && ref.current.checked) {
                ids.push(key);
            }
        }

        if (this._nameInputRef.current !== null) {
            this.props.createAction(this._nameInputRef.current.value, ids);
        }
    }
}

export {RoomOrGroupCreationModal};
