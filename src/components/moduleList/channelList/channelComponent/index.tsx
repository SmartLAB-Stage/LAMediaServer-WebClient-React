import {Channel} from "model/channel";
import React from "react";
import {
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";
import {CallButton} from "./callButton";
import "components/moduleList/channelList/channelComponent/channelComponent.scss";

interface ChannelComponentProps {
    currentChannelChangeCallback: () => void,
    channel: Channel,
    selected: boolean,
    videoConferenceChangeCallback: () => void,
    videoConferenceConnectedRoomId: string | null,
}

class ChannelComponent extends React.Component<ChannelComponentProps, {}> {
    public render(): React.ReactNode {

        return (
            <>
                <div className={"col"}>
                    <OverlayTrigger placement={"top"}
                                    overlay={
                                        (props) => (
                                            <Tooltip id={`tooltip-${this.props.channel.id}`} {...props}>
                                                {this.props.channel.name}
                                            </Tooltip>
                                        )
                                    }>
                        <div onClick={() => this.props.currentChannelChangeCallback()}
                             className={
                                 "channel-button " +
                                 "button " +
                                 "list-group-item " +
                                 "list-group-item-action " +
                                 (this.props.selected ? "list-group-item-info " : null)
                             }>
                            <div className={"media"}>
                                <div className={"svg-align-container"}>
                                    <div className={"svg-align-center"}>
                                        <img src={"/static/res/chat-logo.svg"}
                                             alt={"Salon"}
                                             width={"100%"}
                                        />
                                    </div>
                                </div>
                                <div className={"media-body ml-4"}>
                                    <div className={"d-flex align-items-center justify-content-between mb-1"}>
                                        <h6 className={"mb-0"}>
                                            {this.props.channel.name}
                                        </h6>
                                        <div>
                                            <CallButton
                                                selected={
                                                    this.props.channel.id === this.props.videoConferenceConnectedRoomId
                                                }
                                                videoConferenceChangeCallback={
                                                    this.props.videoConferenceChangeCallback
                                                }
                                            />
                                        </div>
                                        <small className={"small font-weight-bold"}>
                                            {this.props.channel.lastMessage
                                                ? this.props.channel.lastMessage.parentUser.name
                                                : <i>Inconnu</i>
                                            }
                                        </small>
                                    </div>
                                    <p className={"message"}>
                                        {this.props.channel.lastMessage
                                            ? this.props.channel.lastMessage.content
                                            : <i>Dernier message non disponible</i>
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </OverlayTrigger>
                </div>
                <div className={"w-100"}/>
            </>
        );
    }
}

export {ChannelComponent};
