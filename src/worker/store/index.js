import { createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import { composeWithDevTools } from "remote-redux-devtools";

import mySaga from "./my-saga";

const reducer = function (state = { finishedTask: 0, data: [] }, action) {
    switch (action.type) {
        case "FINISHED_TASK":
            console.log("Worker A has done his task: ");
            return {
                ...state,
                data: action.data,
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
    composeWithDevTools(
        applyMiddleware(sagaMiddleware),
    ),
);

// then run the saga
sagaMiddleware.run(mySaga);

export default store;