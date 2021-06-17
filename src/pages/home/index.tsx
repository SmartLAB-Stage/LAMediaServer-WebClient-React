import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import colors from "colors.module.scss";
import {APIRequest} from "common/APIRequest";
import {GroupList} from "components/groupList";
import {Group} from "model/group";
import "pages/home/home.scss";
import React from "react";
import {Form,} from "react-bootstrap";

interface HomeProps {
}

interface HomeState {
    groups: Group[],
}

class HomePage extends React.Component<HomeProps, HomeState> {
    public constructor(props: HomeProps) {
        super(props);

        this.state = {
            groups: [],
        };

        this._updateFromAPI();
    }

    public render(): React.ReactNode {
        const groupList: React.ReactNode = (
            <GroupList
                groups={this.state.groups}
            />
        );

        return (
            <main className={"rooms container-fluid py-5 px-4"}>
                <div className={"row rounded-lg overflow-hidden shadow"}>
                    {groupList}

                    <div className={"col-8 px-0"}>
                        <div className={"px-4 py-5 chat-box bg-white"}>
                            <i>
                                Choisissez une discussion depuis la liste de gauche
                            </i>
                        </div>

                        <Form onSubmit={() => undefined}
                              className={"bg-light"}>
                            <div className={"input-group"}>
                                <input type={"text"}
                                       placeholder={"Entrez votre message"}
                                       aria-describedby={"button-addon2"}
                                       disabled={true}
                                       className={"form-control rounded-0 border-0 py-4 bg-light"}
                                       value={""}
                                />
                                <div className={"input-group-append"}>
                                    <button id={"button-addon2"}
                                            type={"submit"}
                                            disabled={true}
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
}

export {HomePage};
