import {Group} from "model/group";
import {Room} from "model/room";
import React from "react";
import {
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";
import "./roomList.scss";

interface RoomListProps {
    currentRoomChangeCallback: (room: Room, group: Group) => void,
    parentGroup: Group,
    rooms: Room[],
    selectedRoomId: string | null,
}

class RoomList extends React.Component<RoomListProps, {}> {
    public render(): React.ReactNode {
        const reactRooms: React.ReactNode[] = [];

        for (const room of this.props.rooms) {
            reactRooms.push(
                <React.Fragment key={"roomListElement-" + room.id}>
                    <div className={"col"}>
                        <OverlayTrigger placement="top"
                                        overlay={(props) => this._renderTooltip(props, room)}>
                            <button onClick={() => this.props.currentRoomChangeCallback(room, this.props.parentGroup)}
                                    type={"button"}
                                    className={
                                        "list-group-item " +
                                        "list-group-item-action " +
                                        (this.props.selectedRoomId === room.id ? "list-group-item-info " : "")
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
                                                {room.name}
                                            </h6>
                                            <small className={"small font-weight-bold"}>
                                                {room.lastMessage !== undefined
                                                    ? room.lastMessage.parentUser.name
                                                    : <i>Expéditeur inconnu</i>
                                                }
                                            </small>
                                        </div>
                                        <p className={"message"}>
                                            {room.lastMessage !== undefined
                                                ? room.lastMessage.content
                                                : <i>Dernier message non disponible</i>
                                            }
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </OverlayTrigger>
                    </div>
                    <div className="w-100"/>
                </React.Fragment>,
            );
        }

        return (
            <div key={"roomList-" + this.props.parentGroup.id} className={"room-list"}>
                <div className="container">
                    <div className={"row"}>
                        {reactRooms}
                    </div>
                </div>
            </div>
        );
    }

    private _renderTooltip(props: any, room: Room): React.ReactNode {
        return <Tooltip {...props}>{room.name}</Tooltip>;
    }
}

export {RoomList};
