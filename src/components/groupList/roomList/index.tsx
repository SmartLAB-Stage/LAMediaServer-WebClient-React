import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {APIRequest} from "helper/APIRequest";
import {Group} from "model/group";
import {
    RawRoom,
    Room,
} from "model/room";
import React from "react";
import {Button} from "react-bootstrap";
import {RoomComponent} from "./roomComponent";

interface RoomListProps {
    currentRoomChangeCallback: (room: Room) => void,
    group: Group,
    selectedRoomId: string | null,
    videoConferenceChangeCallback: (room: Room) => void,
    videoConferenceConnectedRoomId: string | null,
}

interface RoomListState {
    rooms: Room[],
}

class RoomList extends React.Component<RoomListProps, RoomListState> {
    private _active = false;

    public constructor(props: RoomListProps) {
        super(props);

        this.state = {
            rooms: [],
        };
    }

    public componentDidMount(): void {
        this._active = true;
        this._updateRoomsFromAPI();
    }

    public componentWillUnmount(): void {
        this._active = false;
    }

    public render(): React.ReactNode {
        const reactRooms: React.ReactNode[] = [];

        for (const room of this.state.rooms) {
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
                            onClick={() => this._createNewRoom("test")}>
                        <FontAwesomeIcon icon={faPlus}/>
                    </Button>
                    <div className={"row"}>
                        {reactRooms}
                    </div>
                </div>
            </div>
        );
    }

    private _updateRoomsFromAPI(): void {
        APIRequest
            .get("/group/room/list")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                groupRoomId: this.props.group.roomId,
            })
            .onSuccess((payload) => {
                const rooms: Room[] = [];
                for (const room of payload.rooms as RawRoom[]) {
                    rooms.push(Room.fromObject(room));
                }
                return rooms;
            })
            .onFailure((status) => {
                // FIXME: Si ce cas de figure arrive c'est que ce groupe a été supprimé
                if (status === 404) {
                    return [] as Room[];
                } else {
                    return null;
                }
            })
            .send()
            .then((rooms: unknown) => {
                if (this.state.rooms[this.props.group.id] === undefined && rooms !== null) {
                    // FIXME: Va set mais pas update
                    this.setState({
                        rooms: rooms as Room[],
                    });
                }
            });
    }

    private _createNewRoom(name: string): void {
        APIRequest
            .post("/group/room/create")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                groupRoomId: this.props.group.roomId,
                name,
            })
            .onSuccess((payload) => {
                this.setState({
                    rooms: [
                        ...this.state.rooms,
                        Room.fromObject(payload as unknown as RawRoom),
                    ],
                });
            })
            .send()
            .then();
    }
}

export {RoomList};
