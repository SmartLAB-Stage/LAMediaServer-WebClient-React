import {
    faPlus,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {VideoSourceModal} from "components/moduleList/videoSourceModal";
import {ChannelOrModuleCreationModal} from "components/shared/channelOrModuleCreationModal";
import {ConfirmationModal} from "components/shared/confirmationModal";
import {InformationModal} from "components/shared/informationModal";
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
import {VideoconferenceType} from "model/videoconference";
import React from "react";
import {Button} from "react-bootstrap";
import {ChannelList} from "./channelList";

interface ModuleListProps {
    activeTextChannelChangeCallback: (channel: Channel) => void,
    activeTextChannel: Channel | null,
    activeVocalChannel: Channel | null,
    activeVocalChannelChangeCallback: (channel: Channel, videoType: VideoconferenceType) => void,
}

interface ModuleListState {
    allUsers: User[],
    createModalOpen: boolean,
    currentSelectedModule: Module | null,
    informationsModal: null | {
        title: string,
        body: string,
    },
    modules: Module[],
    selectedChannelToDeleteInfos: null | {
        channel: Channel,
        parent: Module,
        deleteChannelCallback: () => void,
    },
    selectedModuleToDelete: Module | null,
    vocalChannelVideoSourceCallback: null | ((videoType: VideoconferenceType) => void),
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
            currentSelectedModule: null,
            informationsModal: null,
            modules: [],
            selectedChannelToDeleteInfos: null,
            selectedModuleToDelete: null,
            vocalChannelVideoSourceCallback: null,
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
        for (const currentModule of this.state.modules) {
            let expanded = currentModule === this.state.currentSelectedModule;

            moduleComponents.push(
                <div key={`module-list-module-${currentModule.id}`} className={"card"}>
                    <div className={"card-header"} id={`heading_${currentModule.id}`}>
                        <h5 className={"mb-0"}>
                            <Button className={"btn btn-sm btn-danger"}
                                    onClick={() => this.setState({
                                        selectedModuleToDelete: currentModule,
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
                            <ChannelList activeTextChannel={this.props.activeTextChannel}
                                         activeVocalChannel={this.props.activeVocalChannel}
                                         currentChannelChangeCallback={
                                             (chan: Channel) => {
                                                 this.props.activeTextChannelChangeCallback(chan);
                                             }
                                         }
                                         currentModule={currentModule}
                                         key={"channel-list-" + currentModule.id}
                                         openDeleteChannelModal={(channel: Channel, callback: () => void) => {
                                             this.setState({
                                                 selectedChannelToDeleteInfos: {
                                                     channel,
                                                     parent: currentModule,
                                                     deleteChannelCallback: callback,
                                                 },
                                             });
                                         }}
                                         selectedModuleFound={() => {
                                             this.setState({
                                                 currentSelectedModule: currentModule,
                                             });
                                         }}
                                         videoConferenceChangeCallback={
                                             (channel: Channel) => this.setState({
                                                 vocalChannelVideoSourceCallback: (videoType: VideoconferenceType) => {
                                                     this.props.activeVocalChannelChangeCallback(channel, videoType);
                                                 },
                                             })
                                         }
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
                <ConfirmationModal title={"Supprimer un module"}
                                   body={
                                       "Voulez-vous vraiment supprimer le module" +
                                       `"${this.state.selectedModuleToDelete?.name}" ?`
                                   }
                                   modalClosedCallback={() => this.setState({
                                       selectedModuleToDelete: null,
                                   })}
                                   modalActionCallback={() => this._deleteModule()}
                                   open={this.state.selectedModuleToDelete !== null}/>
                <ConfirmationModal title={"Supprimer un canal"}
                                   body={
                                       "Voulez-vous vraiment supprimer le canal " +
                                       `"${this.state.selectedChannelToDeleteInfos?.channel.name}" ` +
                                       `du module "${this.state.selectedChannelToDeleteInfos?.parent.name}" ?`
                                   }
                                   modalClosedCallback={() => this.setState({
                                       selectedChannelToDeleteInfos: null,
                                   })}
                                   modalActionCallback={() => {
                                       this.state.selectedChannelToDeleteInfos?.deleteChannelCallback();
                                   }}
                                   open={this.state.selectedChannelToDeleteInfos !== null}/>
                <ChannelOrModuleCreationModal closeModalAction={() => this.setState({createModalOpen: false})}
                                              createAction={(name: string, memberIds: string[]) => {
                                                  this._createNewModule(name, memberIds);
                                              }}
                                              modalOpen={this.state.createModalOpen}
                                              type={"module"}
                                              users={this.state.allUsers}/>
                <InformationModal open={this.state.informationsModal !== null}
                                  body={
                                      this.state.informationsModal === null
                                          ? null
                                          : this.state.informationsModal.body
                                  }
                                  modalClosedCallback={() => {
                                      this.setState({
                                          informationsModal: null,
                                      });
                                  }}
                                  title={
                                      this.state.informationsModal === null
                                          ? null
                                          : this.state.informationsModal.title
                                  }/>
                <VideoSourceModal open={this.state.vocalChannelVideoSourceCallback !== null}
                                  changeSourceAction={(videoType: VideoconferenceType) => {
                                      this.state.vocalChannelVideoSourceCallback!(videoType);
                                  }}
                                  modalClosedCallback={() => this.setState({
                                      vocalChannelVideoSourceCallback: null,
                                  })}/>
            </div>
        );
    }

    private _deleteModule(): void {
        if (this.state.selectedModuleToDelete !== null) {
            const selectedModuleToDelete = this.state.selectedModuleToDelete;
            APIRequest
                .delete("/module/delete")
                .authenticate()
                .canceledWhen(() => !this._active)
                .unauthorizedErrorsAllowed()
                .withPayload({
                    moduleId: selectedModuleToDelete.id,
                })
                .onSuccess(() => {
                    this.setState({
                        informationsModal: {
                            title: "Suppression d'un module",
                            body: `Le module "${selectedModuleToDelete.name}" a bien été supprimé`,
                        },
                    });
                })
                .onFailure(() => {
                    this.setState({
                        informationsModal: {
                            title: "Suppression d'un module",
                            body: `Le module "${selectedModuleToDelete.name}" n'a pas pu être supprimé`,
                        },
                    });
                })
                .send()
                .then();
        }
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
            .onSuccess(() => {
                this.setState({
                    informationsModal: {
                        title: "Création d'un module",
                        body: `Le module "${name}" a bien été créé`,
                    },
                });
            })
            .onFailure(() => {
                this.setState({
                    informationsModal: {
                        title: "Création d'un module",
                        body: `Le module "${name}" n'a pas pu être créé`,
                    },
                });
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
                    } else if (mod.id === this.state.currentSelectedModule?.id) {
                        window.location.replace("/channel");
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
