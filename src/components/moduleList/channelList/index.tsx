import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {APIRequest} from "helper/APIRequest";
import {
    Channel,
    RawChannel,
} from "model/channel";
import {Module} from "model/module";
import React from "react";
import {Button} from "react-bootstrap";
import {ChannelComponent} from "./channelComponent";

interface ChannelListProps {
    currentChannelChangeCallback: (channel: Channel) => void,
    currentModule: Module,
    selectedChannelId: string | null,
    videoConferenceChangeCallback: (channel: Channel) => void,
    videoConferenceConnectedRoomId: string | null,
}

interface ChannelListState {
    channels: Channel[],
}

class ChannelList extends React.Component<ChannelListProps, ChannelListState> {
    private _active = false;

    public constructor(props: ChannelListProps) {
        super(props);

        this.state = {
            channels: [],
        };
    }

    public componentDidMount(): void {
        this._active = true;
        this._updateChannelsFromAPI();
    }

    public componentWillUnmount(): void {
        this._active = false;
    }

    public render(): React.ReactNode {
        const channelComponents: React.ReactNode[] = [];

        for (const channel of this.state.channels) {
            channelComponents.push(
                <ChannelComponent channel={channel}
                                  currentChannelChangeCallback={
                                      () => this.props.currentChannelChangeCallback(channel)
                                  }
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
                            onClick={() => this._createNewChannel("test")}>
                        <FontAwesomeIcon icon={faPlus}/>
                    </Button>
                    <div className={"row"}>
                        {channelComponents}
                    </div>
                </div>
            </div>
        );
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

    private _createNewChannel(name: string): void {
        APIRequest
            .post("/module/channel/create")
            .authenticate()
            .canceledWhen(() => !this._active)
            .withPayload({
                moduleRoomId: this.props.currentModule.roomId,
                name,
            })
            .onSuccess((payload) => {
                this.setState({
                    channels: [
                        ...this.state.channels,
                        Channel.fromObject(payload as unknown as RawChannel),
                    ],
                });
            })
            .send()
            .then();
    }
}

export {ChannelList};
