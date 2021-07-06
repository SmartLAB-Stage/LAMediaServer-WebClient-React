import {RoomComponent} from "components/roomList/roomComponent";
import "components/roomList/roomComponent/roomComponent.scss";
import {Room} from "model/room";
import React from "react";

interface RoomListProps {
    currentRoomChangeCallback: (room: Room) => void,
    rooms: Room[],
    selectedRoomId: string | null,
    videoConferenceChangeCallback: (room: Room) => void,
}

class RoomList extends React.Component<RoomListProps, {}> {
    public render(): React.ReactNode {
        const reactRooms: React.ReactNode[] = [];

        for (const room of this.props.rooms) {
            reactRooms.push(<RoomComponent key={"roomListElement-" + room.id}
                                           currentRoomChangeCallback={
                                               () => this.props.currentRoomChangeCallback(room)
                                           }
                                           room={room}
                                           selected={this.props.selectedRoomId === room.id}
                                           videoConferenceChangeCallback={
                                               () => this.props.videoConferenceChangeCallback(room)
                                           }
            />);
        }

        return (
            <div className={"room-list"}>
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
