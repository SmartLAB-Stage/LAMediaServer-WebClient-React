import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import colors from "colors.module.scss";
import {APIRequest} from "common/APIRequest";
import {GroupList} from "components/groupList";
import {MessageList} from "components/messageList";
import {Group} from "model/group";
import {Message} from "model/message";
import "pages/home/home.scss";
import React, {FormEvent,} from "react";
import {Form,} from "react-bootstrap";

interface HomeProps {
}

interface HomeState {
    messages: Message[],
    groups: Group[],
    currentMessageContent: string,
}

class Home extends React.Component<HomeProps, HomeState> {
    public constructor(props: HomeProps) {
        super(props);

        this.state = {
            messages: [],
            groups: [],
            currentMessageContent: "",
        };

        this._updateFromAPI();
    }

    private _updateFromAPI(): void {
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

    public render(): React.ReactNode {
        const roomList: React.ReactNode = (
            <GroupList
                groups={this.state.groups}
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

export {Home};
