import React from "react";
import { connect } from "react-redux";

function Counter({ data = [] }) {
    return (
        <ul>
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

export default connect((state) => {
    return {
        data: state.store.data,
    }
})(Counter)