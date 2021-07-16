import {
    faPlus,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ConfirmationModal} from "components/shared/confirmationModal";
import {RoomOrGroupCreationModal} from "components/shared/roomOrGroupCreationModal";
import {APIRequest} from "helper/APIRequest";
import {APIWebSocket} from "helper/APIWebSocket";
import {Authentication} from "helper/authentication";
import {
    Group,
    RawGroup,
} from "model/group";
import {Room} from "model/room";
import {
    RawUser,
    User,
} from "model/user";
import React from "react";
import {Button} from "react-bootstrap";
import {RoomList} from "./roomList";

interface GroupListProps {
    currentRoomChangeCallback: (room: Room, group: Group) => void,
    selectedRoomId: string | null,
    videoConferenceChangeCallback: (room: Room, group: Group) => void,
    videoConferenceConnectedRoomId: string | null,
}

interface GroupListState {
    allUsers: User[],
    createModalOpen: boolean,
    deleteModalOpen: boolean,
    groups: Group[],
    selectedGroupToDelete: Group | null,
}

class GroupList extends React.Component<GroupListProps, GroupListState> {
    private _active;
    private readonly _sockets: APIWebSocket[];

    public constructor(props: GroupListProps) {
        super(props);

        this._active = false;
        this._sockets = [];

        this.state = {
            allUsers: [],
            createModalOpen: false,
            deleteModalOpen: false,
            groups: [],
            selectedGroupToDelete: null,
        };
    }

    public componentDidMount(): void {
        this._active = true;
        this._updateGroupsFromAPI();
        this._fetchAllUsers();

        this._setSocketGroupCreated();
        this._setSocketGroupDeleted();

        for (const sock of this._sockets) {
            sock.open();
        }
    }

    public componentWillUnmount(): void {
        this._active = false;

        for (const sock of this._sockets) {
            sock.close();
        }
    }

    public render(): React.ReactNode {
        const groupsComponent: React.ReactNode[] = [];
        let expanded = true;

        for (const group of this.state.groups) {
            groupsComponent.push(
                <div key={`group-list-group-${group.id}`} className={"card"}>
                    <div className={"card-header"} id={`heading_${group.id}`}>
                        <h5 className={"mb-0"}>
                            <Button className={"btn btn-sm btn-danger"}
                                    onClick={() => this.setState({
                                        selectedGroupToDelete: group,
                                        deleteModalOpen: true,
                                    })}>
                                <FontAwesomeIcon icon={faTrash}/>
                            </Button>
                            <button className={"btn btn-link " + (expanded ? null : "collapsed")}
                                    data-toggle={"collapse"}
                                    data-target={`#collapse_${group.id}`}
                                    aria-expanded={expanded ? "true" : "false"}
                                    aria-controls={`collapse_${group.id}`}>
                                {group.name}
                            </button>
                        </h5>
                    </div>

                    <div id={`collapse_${group.id}`}
                         className={"collapse " + (expanded ? "show" : null)}
                         aria-labelledby={`heading_${group.id}`}
                         data-parent={"#accordion"}>
                        <div className={"card-body"}>
                            <RoomList key={"roomList-" + group.id}
                                      currentRoomChangeCallback={
                                          (room: Room) => this.props.currentRoomChangeCallback(room, group)
                                      }
                                      group={group}
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
                            onClick={() => this.setState({
                                createModalOpen: true,
                            })}>
                        <FontAwesomeIcon icon={faPlus}/>
                    </Button>
                    {groupsComponent}
                </div>
                <ConfirmationModal body={"Voulez-vous vraiment supprimer ce groupe ?"}
                                   modalClosedCallback={() => this.setState({
                                       selectedGroupToDelete: null,
                                       deleteModalOpen: false,
                                   })}
                                   modalActionCallback={() => this._deleteGroup()}
                                   open={this.state.deleteModalOpen}
                                   title={"Supprimer ce message"}/>
                <RoomOrGroupCreationModal closeModalAction={() => this.setState({createModalOpen: false})}
                                          createAction={(name: string, memberIds: string[]) => {
                                              this._createNewGroup(name, memberIds);
                                          }}
                                          modalOpen={this.state.createModalOpen}
                                          type={"module"}
                                          users={this.state.allUsers}/>
            </div>
        );
    }

    private _deleteGroup(): void {
        if (this.state.selectedGroupToDelete !== null) {
            const groupId = this.state.selectedGroupToDelete.id;
            APIRequest
                .delete("/group/delete")
                .authenticate()
                .canceledWhen(() => !this._active)
                .withPayload({
                    groupId,
                })
                .send()
                .then();
        }

        this.setState({
            selectedGroupToDelete: null,
            deleteModalOpen: false,
        });
    }

    private _updateGroupsFromAPI(): void {
        APIRequest
            .get("/group/list")
            .authenticate()
            .canceledWhen(() => !this._active)
            .onSuccess((payload) => {
                const groups: Group[] = [];

                for (const group of payload.groups as RawGroup[]) {
                    groups.push(Group.fromObject(group));
                }

                this.setState({
                    groups,
                });
            })
            .send()
            .then();
    }

    private _createNewGroup(name: string, memberIds: string[]): void {
        APIRequest
            .post("/group/create")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                name,
                memberIds,
            })
            .send()
            .then();
    }

    private _fetchAllUsers(): void {
        APIRequest
            .get("/user/list")
            .authenticate()
            .canceledWhen(() => !this._active)
            .onSuccess((payload) => {
                const users: User[] = [];
                for (const user of payload.users as RawUser[]) {
                    users.push(User.fromObject(user));
                }

                this.setState({
                    allUsers: users,
                });
            })
            .send()
            .then();
    }

    private _setSocketGroupCreated(): void {
        this._sockets.push(APIWebSocket
            .getSocket("/group/created")
            .withToken()
            .withPayload({
                userId: Authentication.getUserId(),
            })
            .onResponse((data: unknown) => {
                this.setState({
                    groups: [...this.state.groups, Group.fromObject(data as unknown as RawGroup)],
                });
            }),
        );
    }

    private _setSocketGroupDeleted(): void {
        this._sockets.push(APIWebSocket
            .getSocket("/group/deleted")
            .withToken()
            .withPayload({
                userId: Authentication.getUserId(),
            })
            .onResponse((data: unknown) => {
                const groupRoomId = (data as { groupRoomId: string }).groupRoomId;
                const groups: Group[] = [];
                for (const group of this.state.groups) {
                    if (group.roomId !== groupRoomId) {
                        groups.push(group);
                    }
                }
                this.setState({
                    groups,
                });
            }),
        );
    }
}

export {GroupList};
