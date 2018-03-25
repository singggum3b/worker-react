import { runSaga, eventChannel } from "redux-saga";
import { spawn, takeEvery } from "redux-saga/effects";
import { emitter } from "redux-saga/lib/internal/channel";
import { todoSaga } from "./todo-saga";
import {IndexStore} from "../store-ui";

function* dynamicSaga(action: { type: string, saga: () => any, context: object }) {
    try {
        yield spawn([action.context, action.saga], action.context);
    } catch (e) {
        console.error(e);
    }
}

function* saga() {
    try {
        yield takeEvery("RUN_SAGA", dynamicSaga);
        yield spawn(todoSaga);
    } catch (e) {
        console.error(e);
    }
}

export function createSaga(store: IndexStore) {
    const em = emitter();
    const IO = {
        subscribe: em.subscribe,
        dispatch(output: object) {
            em.emit(output);
            return output;
        },
        getState() {
            return null;
        },
    };

    runSaga(IO, saga);

    return {
        dispatch: IO.dispatch,
    };
}
