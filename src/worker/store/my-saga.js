import { take, call, spawn, put } from "redux-saga/effects";
import { delay } from "redux-saga";

import { updateFinishedTask } from './action';

function* workerA(task) {
    console.log("Some one asked workerA to do task : ", task);
    console.log("Doing...");
    // Worker a take 2 second to finish a single given task
    // He's occupied during this time
    yield delay(2000, null);
    // He update the number of finished task to the store
    yield put(updateFinishedTask(task.taskNumber));
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