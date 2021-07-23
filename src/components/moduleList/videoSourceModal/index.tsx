import {VideoconferenceType} from "model/videoconference";
import React from "react";
import {
    Button,
    Modal,
} from "react-bootstrap";

interface VideoSourceModalProps {
    modalClosedCallback: () => void,
    open: boolean,
    changeSourceAction: (type: VideoconferenceType) => void,
}

interface CheckboxInputRef {
    audioOnly: React.RefObject<HTMLInputElement>,
    screenShare: React.RefObject<HTMLInputElement>,
    webcam: React.RefObject<HTMLInputElement>,
}

class VideoSourceModal extends React.Component<VideoSourceModalProps, {}> {
    private readonly _typeInputRefs: CheckboxInputRef;

    public constructor(props: VideoSourceModalProps) {
        super(props);
        this._typeInputRefs = {
            audioOnly: React.createRef(),
            screenShare: React.createRef(),
            webcam: React.createRef(),
        };
    }

    public render(): React.ReactNode {
        return (
            <Modal className={"video-source-selection-modal"}
                   show={this.props.open}
                   onHide={this.props.modalClosedCallback}>
                <form>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>
                            Sélection de la source vidéo
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className={"form-check"}>
                            <input defaultChecked={true}
                                   className={"form-check-input mb-1"}
                                   defaultValue={""}
                                   id={"video-source-modal-input-webcam"}
                                   name={"video-source-modal-input"}
                                   ref={this._typeInputRefs.webcam}
                                   type={"radio"}/>
                            <label className={"form-check-label"} htmlFor={"video-source-modal-input-webcam"}>
                                Webcam
                            </label>
                        </div>
                        <div className={"form-check"}>
                            <input className={"form-check-input mb-1"}
                                   defaultValue={""}
                                   id={"video-source-modal-input-audio-only"}
                                   name={"video-source-modal-input"}
                                   ref={this._typeInputRefs.audioOnly}
                                   type={"radio"}/>
                            <label className={"form-check-label"} htmlFor={"video-source-modal-input-audio-only"}>
                                Audio seulement
                            </label>
                        </div>
                        <div className={"form-check"}>
                            <input className={"form-check-input mb-1"}
                                   defaultValue={""}
                                   id={"video-source-modal-input-screen-share"}
                                   name={"video-source-modal-input"}
                                   ref={this._typeInputRefs.screenShare}
                                   type={"radio"}/>
                            <label className={"form-check-label"} htmlFor={"video-source-modal-input-screen-share"}>
                                Partage d'écran
                            </label>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={"secondary"} onClick={() => this.props.modalClosedCallback()}>
                            Annuler
                        </Button>
                        <Button type={"submit"}
                                variant={"primary"}
                                onClick={(e: React.MouseEvent<HTMLElement>) => {
                                    e.preventDefault();
                                    this._choiceSelected();
                                    this.props.modalClosedCallback();
                                }}>
                            Confirmer
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }

    private _choiceSelected(): void {
        let type: VideoconferenceType;
        if (this._typeInputRefs.audioOnly.current?.checked === true) {
            type = VideoconferenceType.AUDIO_ONLY;
        } else if (this._typeInputRefs.screenShare.current?.checked === true) {
            type = VideoconferenceType.SCREEN_SHARE;
        } else {
            type = VideoconferenceType.WEBCAM;
        }

        this.props.changeSourceAction(type);
    }
}

export {VideoSourceModal};
