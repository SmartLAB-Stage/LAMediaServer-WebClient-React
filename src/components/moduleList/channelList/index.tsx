import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ChannelOrModuleCreationModal} from "components/shared/channelOrModuleCreationModal";
import {InformationModal} from "components/shared/informationModal";
import {APIRequest} from "helper/APIRequest";
import {APIWebSocket} from "helper/APIWebSocket";
import {
    Channel,
    RawChannel,
} from "model/channel";
import {Module} from "model/module";
import {
    RawUser,
    User,
} from "model/user";
import {VideoconferenceType} from "model/videoconference";
import React from "react";
import {Button} from "react-bootstrap";
import {ChannelComponent} from "./channelComponent";

interface ChannelListProps {
    activeTextChannel: Channel | null,
    activeVocalChannel: Channel | null,
    currentChannelChangeCallback: (channel: Channel) => void,
    currentModule: Module,
    openDeleteChannelModal: (channel: Channel, callback: () => void) => void,
    selectedModuleFound: () => void,
    videoConferenceChangeCallback: (channel: Channel, videoType: VideoconferenceType) => void,
}

interface ChannelListState {
    channels: Channel[],
    createModalOpen: boolean,
    informationsModal: null | {
        title: string,
        body: string,
    },
    moduleUsers: User[],
}

class ChannelList extends React.Component<ChannelListProps, ChannelListState> {
    private _active = false;
    private readonly _sockets: APIWebSocket[];

    public constructor(props: ChannelListProps) {
        super(props);

        this._active = false;
        this._sockets = [];

        this.state = {
            channels: [],
            createModalOpen: false,
            informationsModal: null,
            moduleUsers: [],
        };
    }

    public componentDidMount(): void {
        this._active = true;

        this._updateChannelsFromAPI();
        this._fetchModuleUsers();
        this._openSocketChannelCreated();
        this._openSocketChannelDeleted();

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
        const channelComponents: React.ReactNode[] = [];

        for (const channel of this.state.channels) {
            channelComponents.push(
                <ChannelComponent activeVocalChannel={this.props.activeVocalChannel}
                                  channel={channel}
                                  currentChannelChangeCallback={
                                      () => this.props.currentChannelChangeCallback(channel)
                                  }
                                  deleteChannel={() => {
                                      this.props.openDeleteChannelModal(channel, () => this._deleteChannel(channel));
                                  }}
                                  key={"channel-list-element-" + channel.id}
                                  selected={this.props.activeTextChannel?.id === channel.id}
                                  videoConferenceChangeCallback={(videoType: VideoconferenceType) => {
                                      this.props.videoConferenceChangeCallback(channel, videoType);
                                  }}
                />,
            );
        }

        return (
            <div className={"channel-list"}>
                <div className={"container"}>
                    <Button className={"btn btn-sm btn-success"}
                            onClick={() => this.setState({
                                createModalOpen: true,
                            })}>
                        <FontAwesomeIcon icon={faPlus}/>
                    </Button>
                    <div className={"row"}>
                        {channelComponents}
                    </div>
                </div>
                <ChannelOrModuleCreationModal closeModalAction={() => this.setState({createModalOpen: false})}
                                              createAction={(name: string, memberIds: string[]) => {
                                                  this._createNewChannel(name, memberIds);
                                              }}
                                              modalOpen={this.state.createModalOpen}
                                              type={"canal"}
                                              users={this.state.moduleUsers}/>
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
            </div>
        );
    }

    private _deleteChannel(channel: Channel): void {
        APIRequest
            .delete("/module/channel/delete")
            .authenticate()
            .canceledWhen(() => !this._active)
            .unauthorizedErrorsAllowed()
            .withPayload({
                channelId: channel.id,
            })
            .onSuccess(() => {
                this.setState({
                    informationsModal: {
                        title: "Suppression d'un canal",
                        body: `Le canal "${channel.name}" a bien été supprimé`,
                    },
                });
            })
            .onFailure(() => {
                this.setState({
                    informationsModal: {
                        title: "Suppression d'un canal",
                        body: `Le canal "${channel.name}" n'a pas pu être supprimé`,
                    },
                });
            })
            .send()
            .then();
    }

    private _updateChannelsFromAPI(): void {
        APIRequest
            .get("/module/channel/list")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                moduleRoomId: this.props.currentModule.roomId,
            })
            .onSuccess((payload) => {
                const channels: Channel[] = [];
                for (const channel of payload.channels as RawChannel[]) {
                    channels.push(Channel.fromObject(channel));
                }
                return channels;
            })
            .onFailure((status) => {
                // FIXME: Si ce cas de figure arrive c'est que ce module a été supprimé
                if (status === 404) {
                    return [] as Channel[];
                } else {
                    return null;
                }
            })
            .send()
            .then((channels: unknown) => {
                if (channels !== null) {
                    // FIXME: Va set mais pas update
                    this.setState({
                        channels: channels as Channel[],
                    });

                    for (const channel of channels as Channel[]) {
                        if (channel.id === this.props.activeTextChannel?.id) {
                            this.props.selectedModuleFound();
                        }
                    }
                }
            });
    }

    private _createNewChannel(name: string, memberIds: string[]): void {
        APIRequest
            .post("/module/channel/create")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                moduleRoomId: this.props.currentModule.roomId,
                name,
                memberIds,
            })
            .onSuccess(() => {
                this.setState({
                    informationsModal: {
                        title: "Création d'un canal",
                        body: `Le canal "${name}" a bien été créé`,
                    },
                });
            })
            .onFailure(() => {
                this.setState({
                    informationsModal: {
                        title: "Création d'un canal",
                        body: `Le canal "${name}" n'a pas pu être créé`,
                    },
                });
            })
            .send()
            .then();
    }

    private _fetchModuleUsers(): void {
        APIRequest
            .get("/module/user/list")
            .authenticate()
            .withPayload({
                moduleId: this.props.currentModule.id,
            })
            .canceledWhen(() => !this._active)
            .onSuccess((payload) => {
                const users: User[] = [];
                for (const user of payload.users as RawUser[]) {
                    users.push(User.fromObject(user));
                }

                this.setState({
                    moduleUsers: users,
                });
            })
            .send()
            .then();
    }

    private _openSocketChannelCreated(): void {
        this._sockets.push(APIWebSocket
            .getSocket("/module/channel/created")
            .withToken()
            .withPayload({
                moduleRoomId: this.props.currentModule.roomId,
            })
            .onResponse((data: unknown) => {
                this.setState({
                    channels: [...this.state.channels, Channel.fromObject(data as unknown as RawChannel)],
                });
            }),
        );
    }

    private _openSocketChannelDeleted(): void {
        this._sockets.push(APIWebSocket
            .getSocket("/module/channel/deleted")
            .withToken()
            .onResponse((data: unknown) => {
                const channelId = (data as { channelId: string }).channelId;
                const channels: Channel[] = [];
                for (const channel of this.state.channels) {
                    if (channel.id !== channelId) {
                        channels.push(channel);
                    } else if (channel.id === this.props.activeTextChannel?.id) {
                        window.location.replace("/channel");
                    }
                }
                this.setState({
                    channels,
                });
            }),
        );
    }
}

export {ChannelList};
