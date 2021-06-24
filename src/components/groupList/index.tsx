import {APIRequest} from "common/APIRequest";
import {RoomList} from "components/roomList";
import {Group} from "model/group";
import {Room} from "model/room";
import React from "react";
import "./groupList.scss";

interface GroupListProps {
    currentRoomChangeCallback: (room: Room, group: Group) => void,
    groups: Group[],
    selectedRoomFound: (parentGroup: Group) => void,
    selectedRoomId: string | null,
}

interface GroupListState {
    rooms: { [key: string]: Room[] },
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
                <div key={group.id} className={"card"}>
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
                            <RoomList parentGroup={group}
                                      currentRoomChangeCallback={this.props.currentRoomChangeCallback}
                                      selectedRoomId={this.props.selectedRoomId}
                                      rooms={this.state.rooms[group.id] !== undefined
                                          ? this.state.rooms[group.id]
                                          : []
                                      }
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
                    {groupsComponent}
                </div>
            </div>
        );
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
