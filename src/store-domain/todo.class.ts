import {action, observable} from "mobx";
import { TodoStore } from "./todo.store";
import { SyntheticEvent } from "react";

export class Todo {

    public static fromJSON(store: TodoStore, json: { id: number , value: string}): Todo {
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
        this.init();
    }

    @action.bound
    public toggleCompleted = (e: SyntheticEvent<HTMLInputElement>): void => {
        this.completed = e.currentTarget.checked;
    };

    @action.bound
    public toggleEditMode(): void {
        this.editing = !this.editing;
    }

    @action.bound
    public save(v: string): void {
        // if (!this.editing) { return }
        // this.toggleEditMode();
        if (v !== this.value) {
            this.value = v;
        }
    }

    public remove = (): void => {
        this.store.removeTodo(this);
    };

    public toJSON(): {[key: string]: any} {
        const { id, value, completed } = this;
        return { id, value, completed };
    }

    protected init(): void {
        return;
    }
}
