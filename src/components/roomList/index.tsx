import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {RoomComponent} from "components/roomList/roomComponent";
import "components/roomList/roomComponent/roomComponent.scss";
import {Group} from "model/group";
import {Room} from "model/room";
import React from "react";
import {Button} from "react-bootstrap";

interface RoomListProps {
    currentRoomChangeCallback: (room: Room) => void,
    group: Group,
    newRoomCreatedCallback: () => void,
    rooms: Room[],
    selectedRoomId: string | null,
    videoConferenceChangeCallback: (room: Room) => void,
    videoConferenceConnectedRoomId: string | null,
}

class RoomList extends React.Component<RoomListProps, {}> {
    private _active = false;

    public constructor(props: RoomListProps) {
        super(props);

        this.state = {
            rooms: {},
        };
    }

    public componentDidMount(): void {
        this._active = true;
    }

    public componentWillUnmount(): void {
        this._active = false;
    }

    public render(): React.ReactNode {
        const reactRooms: React.ReactNode[] = [];

        for (const room of this.props.rooms) {
            reactRooms.push(
                <RoomComponent key={"roomListElement-" + room.id}
                               currentRoomChangeCallback={
                                   () => this.props.currentRoomChangeCallback(room)
                               }
                               room={room}
                               selected={this.props.selectedRoomId === room.id}
                               videoConferenceChangeCallback={
                                   () => this.props.videoConferenceChangeCallback(room)
                               }
                               videoConferenceConnectedRoomId={this.props.videoConferenceConnectedRoomId}
                />,
            );
        }

        return (
            <div className={"room-list"}>
                <div className="container">
                    <Button className={"btn btn-sm btn-success"}
                            onClick={() => this.props.newRoomCreatedCallback()}>
                        <FontAwesomeIcon icon={faPlus}/>
                    </Button>
                    <div className={"row"}>
                        {reactRooms}
                    </div>
                </div>
            </div>
        );
    }
}

export {RoomList};
