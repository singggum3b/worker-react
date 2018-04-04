import * as React from "react";
import { observer } from "mobx-react";

const TagList: React.StatelessComponent<{}> = observer((_: {}) => {

    return (
        <div className="tag-list">
            <a href="" className="tag-pill tag-default">programming</a>
            <a href="" className="tag-pill tag-default">javascript</a>
            <a href="" className="tag-pill tag-default">emberjs</a>
            <a href="" className="tag-pill tag-default">angularjs</a>
            <a href="" className="tag-pill tag-default">react</a>
            <a href="" className="tag-pill tag-default">mean</a>
            <a href="" className="tag-pill tag-default">node</a>
            <a href="" className="tag-pill tag-default">rails</a>
        </div>
    )
});

TagList.displayName = "TagList";

export default TagList;
