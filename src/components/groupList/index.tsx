import {RoomList} from "components/roomList";
import {Group} from "model/group";
import React from "react";
import "./groupList.scss";

interface GroupListProps {
    groups: Group[],
}

interface GroupListState {}

class GroupList extends React.Component<GroupListProps, GroupListState> {
    public render(): React.ReactNode {
        const groupsComponent: React.ReactNode[] = [];
        let expanded = true;

        for (let group of this.props.groups) {
            groupsComponent.push(
                <div className={"card"}>
                    <div className={"card-header"} id={`heading_${group.id}`}>
                        <h5 className={"mb-0"}>
                            <button className={"btn btn-link " + (expanded ? "" : "collapsed")}
                                    data-toggle={"collapse"}
                                    data-target={`#collapse_${group.id}`}
                                    aria-expanded={expanded ? "true" : "false"}
                                    aria-controls={`collapse_${group.id}`}>
                                {group.name}
                            </button>
                        </h5>
                    </div>

                    <div id={`collapse_${group.id}`}
                         className={"collapse " + (expanded ? "show" : "")}
                         aria-labelledby={`heading_${group.id}`}
                         data-parent={"#accordion"}>
                        <div className={"card-body"}>
                            <RoomList rooms={[]}/>
                        </div>
                    </div>
                </div>
            );

            expanded = false;
        }

        return (
            <div className={"room-list col-4 px-0"}>
                <div className={"bg-white"}>
                    <div className={"bg-gray px-4 py-2 bg-light"}>
                        <p className={"h5 mb-0 py-1"}>
                            Groupes
                        </p>
                    </div>

                    <div id={"accordion"}>
                        {groupsComponent}
                    </div>
                </div>
            </div>
        );
    }
}

export {GroupList};
