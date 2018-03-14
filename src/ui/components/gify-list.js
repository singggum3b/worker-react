import React from "react";
import { observer } from 'mobx-react';

import type Gify from "../../store-domain/gify.class";

import styles from "./gify-list.styl";

const GifyItem = observer((props : { gify: Gify }) => {
    return (
        <li className={styles.gifyItem}>
            <div className="content" onClick={props.gify.showFullScreen}>
                <div className="square">
                    <img className="preview" src={props.gify.preview} alt={props.gify.title} />
                </div>
                <h4 className="title" title={props.gify.title}>{props.gify.title}</h4>
                <div className={styles.user}>
                    <img className="avatar" src={props.gify.user.avatar_url} alt={props.gify.user.username} width="20" />
                    <a href={props.gify.user.profile_url}>{props.gify.user.username}</a>
                </div>
            </div>
        </li>
    )
});

GifyItem.displayName = "GifyItem";

const GifyList = observer(({ gifyList }) => {
    return (
        <ul className={styles.gifyList}>
            {
                gifyList.map((gify: Gify) => {
                    return <GifyItem gify={gify} key={gify.id} />
                })
            }
        </ul>
    )
});

GifyList.displayName = "GifyList";

export default GifyList;