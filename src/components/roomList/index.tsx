import {Room} from "model/room";
import React from "react";
import "./roomList.scss";

interface RoomListProps {
    rooms: Room[],
}

interface RoomListState {}

class RoomList extends React.Component<RoomListProps, RoomListState> {
    public render(): React.ReactNode {
        const rooms: React.ReactNode[] = [];

        for (let i = 0; i < 5; ++i) {
            rooms.push(
                <a href={"/rooms/:id"}
                   className={"list-group-item list-group-item-action list-group-item-light rounded-0"}>
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
                                    John Doe
                                </h6>
                                <small className={"small font-weight-bold"}>
                                    14 Dec
                                </small>
                            </div>
                            <p className={"font-italic text-muted mb-0 text-small"}>
                                Lorem ipsum dolor sit amet, consectetur. incididunt ut labore.
                            </p>
                        </div>
                    </div>
                </a>
            );
        }

        return (
            <div className={"room-list"}>
                {rooms}
            </div>
        );
    }
}

export {RoomList};
