import {User} from "model/user";
import {VideoconferencePublisher} from "model/videoconference";
import React from "react";
import "./personalVideoPreview.scss";

interface PersonalVideoPreviewProps {
    user: User,
    videoconferencePublisher: VideoconferencePublisher,
}

class PersonalVideoPreview extends React.Component<PersonalVideoPreviewProps, {}> {
    public componentDidMount(): void {
        const DOM_id = this.props.videoconferencePublisher.DOM_id;
        this.props.videoconferencePublisher.publisher.createVideoElement(DOM_id);
    }

    public componentDidUpdate(prevProps: PersonalVideoPreviewProps): void {
        if (prevProps.videoconferencePublisher.DOM_id !== this.props.videoconferencePublisher.DOM_id) {
            const DOM_id = this.props.videoconferencePublisher.DOM_id;
            this.props.videoconferencePublisher.publisher.createVideoElement(DOM_id);
        }
    }

    public render(): React.ReactNode {
        return <div id={this.props.videoconferencePublisher.DOM_id}/>;
    }
}

export {PersonalVideoPreview};
