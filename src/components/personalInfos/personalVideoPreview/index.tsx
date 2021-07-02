import {User} from "model/user";
import {VideoconferencePublisher} from "model/videoconference";
import React from "react";

interface PersonalVideoPreviewProps {
    user: User,
    videoconferencePublisher: VideoconferencePublisher,
}

class PersonalVideoPreview extends React.Component<PersonalVideoPreviewProps, {}> {
    public componentDidMount(): void {
        if (this.props.videoconferencePublisher !== null) {
            const DOM_id = this.props.videoconferencePublisher.DOM_id;
            this.props.videoconferencePublisher.publisher.createVideoElement(DOM_id);
        }
    }

    public componentDidUpdate(prevProps: PersonalVideoPreviewProps): void {
        if (prevProps.videoconferencePublisher === null && this.props.videoconferencePublisher !== null) {
            const DOM_id = this.props.videoconferencePublisher.DOM_id;
            this.props.videoconferencePublisher.publisher.createVideoElement(DOM_id);
        }
    }

    public render(): React.ReactNode {
        return <div id={this.props.videoconferencePublisher.DOM_id}/>;
    }
}

export {PersonalVideoPreview};
