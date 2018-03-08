import { runSaga, eventChannel } from 'redux-saga'
import { spawn } from 'redux-saga/effects';
import tripSaga from './trip-saga';

function* saga() {
    yield spawn(tripSaga);
}

export default function (store) {
    let emitter;
    const IO = {
        subscribe(callback) {
            emitter = callback;
            return () => {
                // Disposer do nothing
            }
        },
        dispatch(output) {
            emitter(output);
        },
        getState() {
            return null;
        }
    };
    runSaga(IO, saga);

    window.dispatch = IO.dispatch;

    return {
        dispatch: IO.dispatch,
    }
}
