import {Room} from "model/room";
import React from "react";
import {
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";

interface RoomComponentProps {
    currentRoomChangeCallback: () => void,
    room: Room,
    selected: boolean,
}

class RoomComponent extends React.Component<RoomComponentProps, {}> {
    public render(): React.ReactNode {
        return (
            <>
                <div className={"col"}>
                    <OverlayTrigger placement="top"
                                    overlay={
                                        // @ts-ignore
                                        (props) => <Tooltip {...props}>{this.props.room.name}</Tooltip>
                                    }>
                        <button onClick={() => this.props.currentRoomChangeCallback()}
                                type={"button"}
                                className={
                                    "list-group-item " +
                                    "list-group-item-action " +
                                    (this.props.selected ? "list-group-item-info " : "")
                                }>
                            <div className={"media"}>
                                <div className={"svg-align-container"}>
                                    <div className={"svg-align-center"}>
                                        <img src={"/static/res/chat-logo.svg"}
                                             alt={"Salon"}
                                             width={"100%"}
                                        />
                                    </div>
                                </div>
                                <div className={"media-body ml-4"}>
                                    <div className={"d-flex align-items-center justify-content-between mb-1"}>
                                        <h6 className={"mb-0"}>
                                            {this.props.room.name}
                                        </h6>
                                        <small className={"small font-weight-bold"}>
                                            {this.props.room.lastMessage !== undefined
                                                ? this.props.room.lastMessage.parentUser.name
                                                : <i>Expéditeur inconnu</i>
                                            }
                                        </small>
                                    </div>
                                    <p className={"message"}>
                                        {this.props.room.lastMessage !== undefined
                                            ? this.props.room.lastMessage.content
                                            : <i>Dernier message non disponible</i>
                                        }
                                    </p>
                                </div>
                            </div>
                        </button>
                    </OverlayTrigger>
                </div>
                <div className="w-100"/>
            </>
        );
    }
}

export {RoomComponent};
