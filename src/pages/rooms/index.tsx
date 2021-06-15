import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {MessageList} from "components/messageList";
import {RoomList} from "components/roomList";
import {Channel} from "model/channel";
import {Message} from "model/message";
import React, {
    ChangeEvent,
    FormEvent
} from "react";
import {Form,} from "react-bootstrap";
import colors from "../../colors.module.scss";
import "./rooms.scss";

interface RoomsProps {}

interface RoomsState {
    messages: Message[],
    rooms: Channel[],
    currentMessageContent: string,
}

class Rooms extends React.Component<RoomsProps, RoomsState> {
    public constructor(props: RoomsProps) {
        super(props);

        this.state = {
            messages: [],
            rooms: [],
            currentMessageContent: "",
        };

        this._populateDebug();
    }

    public render(): React.ReactNode {
        const roomList: React.ReactNode = (
            <RoomList
                rooms={this.state.rooms}
            />
        );

        return (
            <main className={"rooms container-fluid py-5 px-4"}>
                <div className={"row rounded-lg overflow-hidden shadow"}>
                    {roomList}

                    <div className={"col-8 px-0"}>
                        <MessageList
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

    /**
     * TODO: Supprimer cette fonction de debug
     * @private
     */
    private _populateDebug() {
        console.log("test");
        const messages: Message[] = [];
        for (let i = 0; i < 10; ++i) {
            messages.push(Message.test("OK"));
        }

        // eslint-disable-next-line react/no-direct-mutation-state
        this.state = {
            messages: messages,
            rooms: [],
            currentMessageContent: "",
        };
    }

    private _handleSendMessage(evt: FormEvent) {
        evt.preventDefault();

        if (this.state.currentMessageContent.length === 0) {
            return;
        }

        const newMessage = Message.test(this.state.currentMessageContent);
        this.setState(prevState => {
            return {
                messages: [...prevState.messages, newMessage],
            };
        });

        this.setState({
            currentMessageContent: "",
        });
    }
}

export {Rooms};
