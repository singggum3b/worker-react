import {action, observable} from 'mobx';
import { TodoStore } from "./todo.store";
import { RemoveTodoAction } from "../saga/todo-action";
import { SyntheticEvent } from "react";

export class Todo {

    public id: number;
    public store: TodoStore;
    @observable public value: string = "";
    @observable public completed: boolean = false;
    @observable public editing: boolean = false;
    @observable public focused: boolean = false;

    constructor(id: number, store: TodoStore, value: string) {
        this.id = id;
        this.store = store;
        this.value = value;
    }

    @action.bound
    public toggleCompleted = (e: SyntheticEvent<HTMLInputElement>) => {
        this.completed = e.currentTarget.checked;
    };

    @action.bound
    public toggleEditMode() {
        this.editing = !this.editing;
    }

    public remove = () => {
        this.store.dispatch(new RemoveTodoAction(this));
    };

    public toJSON() {
        const { id, value, completed } = this;
        return { id, value, completed };
    }
}
