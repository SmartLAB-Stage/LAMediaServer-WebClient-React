import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import colors from "colors.module.scss";
import {APIRequest} from "common/APIRequest";
import {GroupList} from "components/groupList";
import {MessageList} from "components/messageList";
import {Group} from "model/group";
import "pages/home/home.scss";
import {Message} from "model/message";
import React, {FormEvent,} from "react";
import {Form,} from "react-bootstrap";
import {RouteComponentProps} from "react-router-dom";

interface HomeProps extends RouteComponentProps {
}

interface HomeState {
    groups: Group[],
    currentMessageContent: string,
    roomId: string,
    messages: Message[],
}

class RoomPage extends React.Component<HomeProps, HomeState> {
    private _looping: boolean;

    public constructor(props: HomeProps) {
        super(props);

        this._looping = false;

        this.state = {
            groups: [],
            currentMessageContent: "",
            roomId: this.props.match.params["roomId"],
            messages: [],
        };

        this._updateGroupsFromAPI();
        this._updateMessagesFromAPI();
    }

    public render(): React.ReactNode {
        return (
            <main className={"rooms container-fluid py-5 px-4"}>
                <div className={"row rounded-lg overflow-hidden shadow"}>
                    <GroupList
                        groups={this.state.groups}
                    />

                    <div className={"col-8 px-0"}>
                        <MessageList
                            refreshMessages={() => this._updateMessagesFromAPI()}
                            roomId={this.state.roomId}
                            messages={this.state.messages}
                        />

                        <Form onSubmit={(e) => this._handleSendMessage(e)}
                              className={"bg-light"}>
                            <div className={"input-group"}>
                                <input type={"text"}
                                       placeholder={"Entrez votre message"}
                                       aria-describedby={"button-addon2"}
                                       className={"form-control rounded-0 border-0 py-4 bg-light"}
                                       value={this.state.currentMessageContent}
                                       onChange={(e) => this.setState({
                                           currentMessageContent: e.target.value,
                                       })}
                                />
                                <div className={"input-group-append"}>
                                    <button id={"button-addon2"}
                                            type={"submit"}
                                            disabled={this.state.currentMessageContent.length === 0}
                                            className={"btn btn-link"}>
                                        <FontAwesomeIcon icon={"paper-plane"} style={{color: colors.accentColor}}/>
                                    </button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </main>
        );
    }

    private _updateGroupsFromAPI(): void {
        APIRequest
            .get("/group/list")
            .authenticate()
            .onSuccess((status, data) => {
                const groups: Group[] = [];

                for (const group of data.payload) {
                    groups.push(Group.fromFullObject(group));
                }

                this.setState({
                    groups: groups
                });
            }).send().then();
    }

    private _updateMessagesFromAPI(): void {
        APIRequest
            .get("/group/room/message/list")
            .authenticate()
            .withPayload({
                roomId: this.state.roomId,
            }).onSuccess((status, data) => {
                const messages: Message[] = [];

                for (const message of data.payload) {
                    messages.unshift(Message.fromFullMessage(message));
                }

                this.setState({
                    messages: messages,
                });
            }).send().then();

        if (!this._looping) {
            this._looping = true;
            setTimeout(() => {
                // FIXME: Transformer ça en websocket
                this._looping = false;
                this._updateMessagesFromAPI();
            }, 10_000);
        }
    }

    private async _handleSendMessage(evt: FormEvent): Promise<void> {
        evt.preventDefault();

        if (this.state.currentMessageContent.length === 0) {
            return;
        }

        await APIRequest
            .post("/group/room/message/send")
            .authenticate()
            .minTime(100)
            .withPayload({
                message: this.state.currentMessageContent,
                roomId: this.state.roomId,
            }).onSuccess((status, data) => {
                console.log(data);
            }).send();

        this._updateMessagesFromAPI();

        this.setState({
            currentMessageContent: "",
        });
    }
}

export {RoomPage};
