import React from "react";
import { observer } from 'mobx-react';

import type Gify from "../../store-domain/gify.class";

import styles from "./gify-list.styl";

type Model = {
    gify: Gify,
    close: Function,
}

const GifyFullView = observer((props : { model: Model }) => {
    if (!props.model.gify) return null;
    return (
        <div className={styles.fullView} onClick={props.model.close}>
            <div className="content">
                <img src={props.model.gify.url} alt={props.model.gify.title} />
                <button className="close" onClick={props.model.close}>Close</button>
            </div>
        </div>
    )
});

GifyFullView.displayName = "GifyFullView";

export default GifyFullView;