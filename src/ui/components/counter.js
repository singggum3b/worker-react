import React from "react";
import { connect } from "react-redux";

function Counter({ finishedTask }) {
    return (
        <div>{ finishedTask }</div>
    )
}

export default connect((state) => {
    return {
        count: state.store.finishedTask,
    }
})(Counter)