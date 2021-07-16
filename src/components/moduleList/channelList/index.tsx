import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ChannelOrModuleCreationModal} from "components/shared/channelOrModuleCreationModal";
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
import React from "react";
import {Button} from "react-bootstrap";
import {ChannelComponent} from "./channelComponent";

interface ChannelListProps {
    currentChannelChangeCallback: (channel: Channel) => void,
    currentModule: Module,
    openDeleteChannelModal: (channel: Channel, callback: () => void) => void,
    selectedChannelId: string | null,
    videoConferenceChangeCallback: (channel: Channel) => void,
    videoConferenceConnectedRoomId: string | null,
}

interface ChannelListState {
    channels: Channel[],
    createModalOpen: boolean,
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
                <ChannelComponent channel={channel}
                                  currentChannelChangeCallback={
                                      () => this.props.currentChannelChangeCallback(channel)
                                  }
                                  deleteChannel={() => {
                                      this.props.openDeleteChannelModal(channel, () => this._deleteChannel(channel));
                                  }}
                                  key={"channel-list-element-" + channel.id}
                                  selected={this.props.selectedChannelId === channel.id}
                                  videoConferenceChangeCallback={
                                      () => this.props.videoConferenceChangeCallback(channel)
                                  }
                                  videoConferenceConnectedRoomId={this.props.videoConferenceConnectedRoomId}
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
            </div>
        );
    }

    private _deleteChannel(channel: Channel): void {
        APIRequest
            .delete("/module/channel/delete")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                channelId: channel.id,
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
            .getSocket("/module/channels/deleted")
            .withToken()
            .onResponse((data: unknown) => {
                const channelId = (data as { channelId: string }).channelId;
                const channels: Channel[] = [];
                for (const channel of this.state.channels) {
                    if (channel.id !== channelId) {
                        channels.push(channel);
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
