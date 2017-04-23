import { take, call, spawn, put } from "redux-saga/effects";
import { delay } from "redux-saga";

import { updateFinishedTask } from './action';

function* workerA(task) {
    const response = yield self.fetch("/BRDRestService/BRDRestService.svc/GetAllBus");
    const data = yield response.json();
    yield put(updateFinishedTask(data));
    return "Result of the task";
}

export default function* mySaga() {
    yield spawn(function* () {
        while (true) {
            try {
                const task = yield take("TASK_FOR_A");
                const result = yield call(workerA, task);
            } catch (e) {
                console.error(e);
            }
        }
    });
}