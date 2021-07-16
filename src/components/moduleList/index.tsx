import {
    faPlus,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ChannelOrModuleCreationModal} from "components/shared/channelOrModuleCreationModal";
import {ConfirmationModal} from "components/shared/confirmationModal";
import {APIRequest} from "helper/APIRequest";
import {APIWebSocket} from "helper/APIWebSocket";
import {Channel} from "model/channel";
import {
    Module,
    RawModule,
} from "model/module";
import {
    RawUser,
    User,
} from "model/user";
import React from "react";
import {Button} from "react-bootstrap";
import {ChannelList} from "./channelList";

interface ModuleListProps {
    currentChannelChangeCallback: (channel: Channel, mod: Module) => void,
    selectedChannelId: string | null,
    videoConferenceChangeCallback: (channel: Channel, mod: Module) => void,
    videoConferenceConnectedRoomId: string | null,
}

interface ModuleListState {
    allUsers: User[],
    createModalOpen: boolean,
    deleteModalOpen: boolean,
    modules: Module[],
    selectedModuleToDelete: Module | null,
}

class ModuleList extends React.Component<ModuleListProps, ModuleListState> {
    private _active;
    private readonly _sockets: APIWebSocket[];

    public constructor(props: ModuleListProps) {
        super(props);

        this._active = false;
        this._sockets = [];

        this.state = {
            allUsers: [],
            createModalOpen: false,
            deleteModalOpen: false,
            modules: [],
            selectedModuleToDelete: null,
        };
    }

    public componentDidMount(): void {
        this._active = true;
        this._updateModulesFromAPI();
        this._fetchAllUsers();

        this._openSocketModuleCreated();
        this._openSocketModuleDeleted();

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
        const moduleComponents: React.ReactNode[] = [];
        let expanded = true;

        for (const currentModule of this.state.modules) {
            moduleComponents.push(
                <div key={`module-list-module-${currentModule.id}`} className={"card"}>
                    <div className={"card-header"} id={`heading_${currentModule.id}`}>
                        <h5 className={"mb-0"}>
                            <Button className={"btn btn-sm btn-danger"}
                                    onClick={() => this.setState({
                                        selectedModuleToDelete: currentModule,
                                        deleteModalOpen: true,
                                    })}>
                                <FontAwesomeIcon icon={faTrash}/>
                            </Button>
                            <button className={"btn btn-link " + (expanded ? null : "collapsed")}
                                    data-toggle={"collapse"}
                                    data-target={`#collapse_${currentModule.id}`}
                                    aria-expanded={expanded ? "true" : "false"}
                                    aria-controls={`collapse_${currentModule.id}`}>
                                {currentModule.name}
                            </button>
                        </h5>
                    </div>

                    <div id={`collapse_${currentModule.id}`}
                         className={"collapse " + (expanded ? "show" : null)}
                         aria-labelledby={`heading_${currentModule.id}`}
                         data-parent={"#accordion"}>
                        <div className={"card-body"}>
                            <ChannelList key={"channel-list-" + currentModule.id}
                                         currentChannelChangeCallback={
                                             (chan: Channel) => {
                                                 this.props.currentChannelChangeCallback(chan, currentModule);
                                             }
                                         }
                                         currentModule={currentModule}
                                         selectedChannelId={this.props.selectedChannelId}
                                         videoConferenceChangeCallback={
                                             (chan: Channel) => {
                                                 this.props.videoConferenceChangeCallback(chan, currentModule);
                                             }
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
            <div className={"channel-list bg-white"}>
                <div id={"accordion"}>
                    <Button className={"btn btn-sm btn-success"}
                            onClick={() => this.setState({
                                createModalOpen: true,
                            })}>
                        <FontAwesomeIcon icon={faPlus}/>
                    </Button>
                    {moduleComponents}
                </div>
                <ConfirmationModal body={"Voulez-vous vraiment supprimer ce module ?"}
                                   modalClosedCallback={() => this.setState({
                                       selectedModuleToDelete: null,
                                       deleteModalOpen: false,
                                   })}
                                   modalActionCallback={() => this._deleteModule()}
                                   open={this.state.deleteModalOpen}
                                   title={"Supprimer ce message"}/>
                <ChannelOrModuleCreationModal closeModalAction={() => this.setState({createModalOpen: false})}
                                              createAction={(name: string, memberIds: string[]) => {
                                                  this._createNewModule(name, memberIds);
                                              }}
                                              modalOpen={this.state.createModalOpen}
                                              type={"module"}
                                              users={this.state.allUsers}/>
            </div>
        );
    }

    private _deleteModule(): void {
        if (this.state.selectedModuleToDelete !== null) {
            APIRequest
                .delete("/module/delete")
                .authenticate()
                .canceledWhen(() => !this._active)
                .withPayload({
                    moduleId: this.state.selectedModuleToDelete.id,
                })
                .send()
                .then();
        }

        this.setState({
            selectedModuleToDelete: null,
            deleteModalOpen: false,
        });
    }

    private _updateModulesFromAPI(): void {
        APIRequest
            .get("/module/list")
            .authenticate()
            .canceledWhen(() => !this._active)
            .onSuccess((payload) => {
                const modules: Module[] = [];

                for (const mod of payload.modules as RawModule[]) {
                    modules.push(Module.fromObject(mod));
                }

                this.setState({
                    modules,
                });
            })
            .send()
            .then();
    }

    private _createNewModule(name: string, memberIds: string[]): void {
        APIRequest
            .post("/module/create")
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

    private _openSocketModuleCreated(): void {
        this._sockets.push(APIWebSocket
            .getSocket("/module/created")
            .withToken()
            .onResponse((data: unknown) => {
                this.setState({
                    modules: [...this.state.modules, Module.fromObject(data as unknown as RawModule)],
                });
            }),
        );
    }

    private _openSocketModuleDeleted(): void {
        this._sockets.push(APIWebSocket
            .getSocket("/module/deleted")
            .withToken()
            .onResponse((data: unknown) => {
                const moduleRoomId = (data as { moduleRoomId: string }).moduleRoomId;
                const modules: Module[] = [];
                for (const mod of this.state.modules) {
                    if (mod.roomId !== moduleRoomId) {
                        modules.push(mod);
                    }
                }
                this.setState({
                    modules: modules,
                });
            }),
        );
    }
}

export {ModuleList};
