import {Room} from "model/room";
import React from "react";
import "./roomList.scss";

interface RoomListProps {
    rooms: Room[],
}

interface RoomListState {
}

class RoomList extends React.Component<RoomListProps, RoomListState> {
    public render(): React.ReactNode {
        const reactRooms: React.ReactNode[] = [];

        for (const room of this.props.rooms) {
            reactRooms.push(
                <a key={room.id} href={`/room/${room.id}`}
                   className={"list-group-item list-group-item-action list-group-item-light rounded-0"}>
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
                            <p className={"text-muted mb-0 text-small"}>
                                {room.lastMessage !== undefined
                                    ? room.lastMessage.content
                                    : <i>Dernier message non disponible</i>
                                }
                            </p>
                        </div>
                    </div>
                </a>
            );
        }

        return (
            <div key={this.props.rooms.length} className={"room-list"}>
                {reactRooms}
            </div>
        );
    }
}

export {RoomList};
