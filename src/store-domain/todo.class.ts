import { observable } from "mobx";
import { TodoStore } from "./todo.store";
import { RemoveTodoAction } from "../saga/todo-action";
import { SyntheticEvent } from "react";

export class Todo {

    public static fromJSON(store: TodoStore, json: { id: number , value: string}) {
        const newTodo = new Todo(json.id, store, json.value);
        Object.assign(newTodo, json);
        return newTodo;
    }

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

    public toggleCompleted = (e: SyntheticEvent<HTMLInputElement>) => {
        this.completed = e.currentTarget.checked;
    };

    public remove = () => {
        this.store.dispatch(new RemoveTodoAction(this));
    };

    public toJSON() {
        const { id, value, completed, editing, focused } = this;
        return { id, value, completed, editing, focused };
    }
}