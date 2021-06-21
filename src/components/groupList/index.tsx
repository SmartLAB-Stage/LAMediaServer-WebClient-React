import {APIRequest} from "common/APIRequest";
import {RoomList} from "components/roomList";
import {Group} from "model/group";
import {Room} from "model/room";
import React from "react";
import "./groupList.scss";

interface GroupListProps {
    groups: Group[],
}

interface GroupListState {
    rooms: { [key: string]: Room[] },
}

class GroupList extends React.Component<GroupListProps, GroupListState> {
    public constructor(props: GroupListProps) {
        super(props);

        this.state = {
            rooms: {},
        };
    }

    componentDidUpdate(prevProps: GroupListProps) {
        if (prevProps.groups !== this.props.groups) {
            this._updateFromAPI();
        }
    }

    public render(): React.ReactNode {
        const groupsComponent: React.ReactNode[] = [];
        let expanded = true;

        for (let group of this.props.groups) {
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
                            <RoomList rooms={this.state.rooms[group.id] !== undefined
                                ? this.state.rooms[group.id]
                                : []
                            }/>
                        </div>
                    </div>
                </div>
            );

            expanded = false;
        }

        return (
            <div key={this.props.groups.length} className={"room-list col-4 px-0"}>
                <div className={"bg-white"}>
                    <div className={"bg-gray px-4 py-2 bg-light"}>
                        <p className={"h5 mb-0 py-1"}>
                            Groupes
                        </p>
                    </div>

                    <div id={"accordion"}>
                        {groupsComponent}
                    </div>
                </div>
            </div>
        );
    }

    private _updateFromAPI(): void {
        for (const group of this.props.groups) {
            APIRequest
                .get("/group/room/list")
                .authenticate()
                .withPayload({
                    groupRoomId: group.roomId,
                }).onSuccess(
                (status, data) => {
                    const rooms: Room[] = [];

                    for (const room of data.payload) {
                        rooms.push(Room.fromFullObject(room));
                    }

                    return rooms;
                }).onFailure(
                (status, data, evt) => {
                    // FIXME: Si ce cas de figure arrive c'est que ce groupe a été supprimé
                    if (status === 404) {
                        return [] as Room[];
                    } else {
                        return null;
                    }
                }).send()
                .then((rooms) => {
                    if (this.state.rooms[group.id] === undefined && rooms !== null) {
                        // FIXME: Va set mais pas update
                        this.setState({
                            rooms: {
                                ...this.state.rooms,
                                [group.id]: rooms,
                            }
                        });
                    }
                });
        }
    }
}

export {GroupList};
