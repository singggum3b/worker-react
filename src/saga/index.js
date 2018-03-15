import { runSaga, eventChannel } from 'redux-saga'
import { emitter } from "redux-saga/lib/internal/channel";

function* saga() {
    yield null;
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
