import { runSaga, eventChannel } from 'redux-saga'
import { spawn } from 'redux-saga/effects';
import { emitter } from 'redux-saga/lib/internal/channel';
import { todoSaga } from './todo-saga';
import {IndexStore} from '../store-ui';

function* saga() {
    try {
        yield spawn(todoSaga);
    } catch (e) {
        console.error(e);
    }
}

export function createSaga(store: IndexStore) {
    const em = emitter();
    const IO = {
        subscribe: em.subscribe,
        dispatch(output: Object) {
            em.emit(output);
            return output;
        },
        getState() {
            return null;
        }
    };

    runSaga(IO, saga);

    return {
        dispatch: IO.dispatch,
    };
}
