import { createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";

import mySaga from "./my-saga";

const reducer = function (state = { finishedTask: 0 }, action) {
    switch (action.type) {
        case "FINISHED_TASK":
            console.log("Worker A has done his task: ", action.taskNumber);
            return {
                ...state,
                finishedTask: state.finishedTask + 1,
            };
            break;
        default:
            return state;
    }
};

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();
// mount it on the Store
const store = createStore(
    combineReducers({
        store: reducer,
    }),
    applyMiddleware(sagaMiddleware)
);

// then run the saga
sagaMiddleware.run(mySaga);

export default store;