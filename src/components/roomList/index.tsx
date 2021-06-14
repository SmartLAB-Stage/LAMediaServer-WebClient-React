import React from "react";
import "./roomList.scss";

interface RoomListProps {
}

interface RoomListState {
}

export default class RoomList extends React.Component<RoomListProps, RoomListState> {
    public render(): React.ReactNode {
        let rooms: unknown[] = [];

        for (let i = 0; i < 10; ++i) {
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
            <div className={"room-list col-4 px-0"}>
                <div className={"bg-white"}>
                    <div className={"bg-gray px-4 py-2 bg-light"}>
                        <p className={"h5 mb-0 py-1"}>
                            Recent
                        </p>
                    </div>

                    <div className={"messages-box"}>
                        <div className={"list-group rounded-0"}>
                            {rooms}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
