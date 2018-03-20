import { take, call, spawn, put, takeEvery, fork } from "redux-saga/effects";

import { RemoveTodoAction, AddTodoAction } from "./todo-action";

function* removeTodo(action: RemoveTodoAction) {
    yield action.context.removeTodo(action.todo);
}

function* addTodo(action: AddTodoAction) {
    yield "5";
}

export function* todoSaga(): any {
    yield takeEvery(RemoveTodoAction.type, removeTodo);
    yield takeEvery(AddTodoAction.type, addTodo);
}
