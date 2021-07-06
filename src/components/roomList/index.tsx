import {RoomComponent} from "components/roomList/roomComponent";
import {Group} from "model/group";
import {Room} from "model/room";
import React from "react";
import {Tooltip} from "react-bootstrap";
import "components/roomList/roomComponent/roomComponent.scss";

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
            reactRooms.push(<RoomComponent room={room}
                                           key={"roomListElement-" + room.id}
                                           selected={this.props.selectedRoomId === room.id}
                                           currentRoomChangeCallback={
                                               () => this.props.currentRoomChangeCallback(room, this.props.parentGroup)
                                           }

            />);
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
}

export {RoomList};
