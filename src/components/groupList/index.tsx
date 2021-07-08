import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {RoomList} from "components/roomList";
import {APIRequest} from "helper/APIRequest";
import {Group} from "model/group";
import {Room} from "model/room";
import React from "react";
import {Button} from "react-bootstrap";

interface GroupListProps {
    currentRoomChangeCallback: (room: Room, group: Group) => void,
    groups: Group[],
    selectedRoomFound: (parentGroup: Group) => void,
    selectedRoomId: string | null,
    videoConferenceChangeCallback: (room: Room, group: Group) => void,
    videoConferenceConnectedRoomId: string | null,
}

interface GroupListState {
    rooms: Record<string, Room[]>,
}

class GroupList extends React.Component<GroupListProps, GroupListState> {
    private _active = false;

    public constructor(props: GroupListProps) {
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

    componentDidUpdate(prevProps: GroupListProps): void {
        if (prevProps.groups !== this.props.groups) {
            this._updateRoomsFromAPI();
        }
    }

    public render(): React.ReactNode {
        const groupsComponent: React.ReactNode[] = [];
        let expanded = true;

        for (const group of this.props.groups) {
            groupsComponent.push(
                <div key={`group-list-group-${group.id}`} className={"card"}>
                    <div className={"card-header"} id={`heading_${group.id}`}>
                        <h5 className={"mb-0"}>
                            <button className={"btn btn-link " + (expanded ? "" : "collapsed")}
                                    data-toggle={"collapse"}
                                    data-target={`#collapse_${group.id}`}
                                    aria-expanded={expanded ? "true" : "false"}
                                    aria-controls={`collapse_${group.id}`}>
                                {group.name}
                            </button>
                        </h5>
                    </div>

                    <div id={`collapse_${group.id}`}
                         className={"collapse " + (expanded ? "show" : "")}
                         aria-labelledby={`heading_${group.id}`}
                         data-parent={"#accordion"}>
                        <div className={"card-body"}>
                            <RoomList key={"roomList-" + group.id}
                                      currentRoomChangeCallback={
                                          (room: Room) => this.props.currentRoomChangeCallback(room, group)
                                      }
                                      group={group}
                                      rooms={this.state.rooms[group.id] !== undefined
                                          ? this.state.rooms[group.id]
                                          : []
                                      }
                                      selectedRoomId={this.props.selectedRoomId}
                                      videoConferenceChangeCallback={
                                          (room: Room) => this.props.videoConferenceChangeCallback(room, group)
                                      }
                                      videoConferenceConnectedRoomId={this.props.videoConferenceConnectedRoomId}
                            />
                        </div>
                    </div>
                </div>,
            );

            expanded = false;
        }

        return (
            <div className={"room-list bg-white"}>
                <div id={"accordion"}>
                    <Button className={"btn btn-sm btn-success"}
                            onClick={(e) => this._createNewGroup()}>
                        <FontAwesomeIcon icon={faPlus}/>
                    </Button>
                    {groupsComponent}
                </div>
            </div>
        );
    }

    private async _createNewGroup(): Promise<void> {
        await APIRequest
            .post("/group/room/create")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                name: "bonjour", // TODO: Set ce nom
            })
            .send();
    }

    private _updateRoomsFromAPI(): void {
        for (const group of this.props.groups) {
            APIRequest
                .get("/group/room/list")
                .authenticate()
                .canceledWhen(() => !this._active)
                .withPayload({
                    groupRoomId: group.roomId,
                })
                .onSuccess((status, data) => {
                    const rooms: Room[] = [];

                    for (const room of data.payload) {
                        const roomObject = Room.fromFullObject(room);
                        rooms.push(roomObject);
                        if (roomObject.id === this.props.selectedRoomId) {
                            this.props.selectedRoomFound(group);
                        }
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
                .then((rooms) => {
                    if (this.state.rooms[group.id] === undefined && rooms !== null) {
                        // FIXME: Va set mais pas update
                        this.setState({
                            rooms: {
                                ...this.state.rooms,
                                [group.id]: rooms,
                            },
                        });
                    }
                });
        }
    }
}

export {GroupList};
