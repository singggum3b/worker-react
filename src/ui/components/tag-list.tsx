import * as React from "react";
import { observer } from "mobx-react";
import {UITag, UITagList} from "../../store-ui/ui-model";
import {computed} from "mobx";
import {Tag} from "../../store-domain/tag.class";

interface IProps {
    model: UITagList,
}

@observer
class TagItem extends React.Component<{model: UITag}> {

    @computed get model(): UITag {
        return this.props.model;
    }

    @computed get tag(): Tag {
        return this.props.model.getRoot();
    }

    public render(): React.ReactNode  {
        return (
            <span
                onClick={this.model.openTag}
                key={this.tag.name}
                className="tag-pill tag-default"
            >
                {this.tag.name}
            </span>
        )
    }
}

@observer
class TagList extends React.Component<IProps> {

    public componentDidMount(): void {
        this.props.model.loadTagList();
    }

    @computed get model(): UITagList {
        return this.props.model;
    }

    public render(): React.ReactNode {

        if (!this.model.isLoading && !this.model.hasData) {
            return <div className="tag-list">Nothing to displayed...</div>
        }

        if (this.model.isLoading) {
            return <div className="tag-list">Loading...</div>
        }

        return (
            <div className="tag-list">
                {this.model.tagList.map((t) => (
                    <TagItem model={t} />
                ))}
            </div>
        )
    }
}

export default TagList;
