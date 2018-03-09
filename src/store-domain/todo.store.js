import { observable, computed } from 'mobx';
import Trip from '../store-domain/trip.class';
import { AddTodoAction } from "../saga/todo-action";
import Todo from "./todo.class";

export default class TodoStore {
    indexStore;
    dispatch;
    @observable todoList = [];

    @computed get uncompletedTodoCount() {
        return this.todoList.reduce((result, todo: Todo) => {
            return todo.completed ? result : result + 1;
        }, 0);
    }

    @observable footerState = {
        get uncompletedTodoCount() {
            console.log(this.uncompletedTodoCount);
            return this.uncompletedTodoCount;
        }
    };

    clearCompletedTodo = () => {
        this.todoList = this.todoList.filter(i => !i.completed);
    };

    constructor(indexStore, dispatch) {
        this.indexStore = indexStore;
        this.dispatch = dispatch;
    }

    addTodo = (value: string) => {
        if (value === '') return;
        this.todoList.push(new Todo(Date.now(), this.indexStore.todoStore, value));
        // this.dispatch(new AddTodoAction(value, this));
    };

    removeTodo = (item: Todo) => {
        this.todoList = this.todoList.filter(i => i.id !== item.id);
    }
}