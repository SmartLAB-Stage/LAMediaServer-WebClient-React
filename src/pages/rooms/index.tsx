import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {MessageList} from "components/messageList";
import {RoomList} from "components/roomList";
import React from "react";
import "./rooms.scss";
import colors from "../../colors.module.scss";

interface RoomsProps {}

interface RoomsState {}

class Rooms extends React.Component<RoomsProps, RoomsState> {
    public render(): React.ReactNode {
        return (
            <main className={"rooms container-fluid py-5 px-4"}>
                <div className={"row rounded-lg overflow-hidden shadow"}>
                    <RoomList/>

                    <div className={"col-8 px-0"}>
                        <MessageList/>

                        <form action={"#"} className={"bg-light"}>
                            <div className={"input-group"}>
                                <input type={"text"}
                                       placeholder={"Type a message"}
                                       aria-describedby={"button-addon2"}
                                       className={"form-control rounded-0 border-0 py-4 bg-light"}
                                />
                                <div className={"input-group-append"}>
                                    <button id={"button-addon2"}
                                            type={"submit"}
                                            className={"btn btn-link"}>
                                        <FontAwesomeIcon icon={"paper-plane"} style={{color: colors.accentColor}}/>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        );
    }
}

export {Rooms};
