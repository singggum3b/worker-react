import React from "react";
import { connect } from "react-redux";
import styles from './counter.styl';

function Counter({ data = [], className, defaultClassName }) {
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
}

Counter.defaultProps = {
  defaultClassName: styles.counter,
};

export default connect((state) => {
    return {
        data: state.store.data,
    }
})(Counter)