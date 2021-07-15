import {
    Presence,
    presenceToReadableInfos,
} from "model/presence";
import React from "react";

interface PresenceBadgeProps {
    presence: Presence,
}

class PresenceBadge extends React.Component<PresenceBadgeProps, {}> {
    public render(): React.ReactNode {
        const infos = presenceToReadableInfos(this.props.presence);
        return (
            <span className={"badge badge-outline badge-sm badge-pill badge-" + infos.badgeColor}>
                {this.props.presence}
            </span>
        );
    }
}

export {PresenceBadge};
