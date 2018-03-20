import React from "react";
import { observer } from "mobx-react";

import styles from "./counter.styl";

const Counter = observer(({ data = [], className, defaultClassName }) => {
    return (
        <ul className={defaultClassName + " " + (className || "")}>
            {
                data.map((item) => {
                    return (
                        <li key={item.TRIPID}>
                            <div>TIMEPOINT: {item.TIMEPOINT}</div>
                            <div>LATITUDE: {item.LATITUDE}</div>
                            <div>LONGITUDE: {item.LONGITUDE}</div>
                        </li>
                    );
                })
            }
        </ul>
    )
});

Counter.defaultProps = {
  defaultClassName: styles.counter,
};

export default Counter;