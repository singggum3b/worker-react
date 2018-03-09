import { runSaga, eventChannel } from 'redux-saga'
import { spawn } from 'redux-saga/effects';
import { emitter } from "redux-saga/lib/internal/channel";
import tripSaga from './trip-saga';
import todoSaga from './todo-saga';

function* saga() {
    try {
        yield spawn(tripSaga);
        yield spawn(todoSaga);
    } catch (e) {
        console.error(e);
    } finally {}
}

export default function (store) {
    let em = emitter();
    const IO = {
        subscribe: em.subscribe,
        dispatch(output) {
            em.emit(output);
            return output;
        },
        getState() {
            return null;
        }
    };
    window.dispatch = IO.dispatch;
    runSaga(IO, saga);

    return {
        dispatch: IO.dispatch,
    }
}
