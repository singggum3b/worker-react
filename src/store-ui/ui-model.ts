import {IndexStore} from "./index";
import {TodoStore} from "../store-domain/todo.store";
import {action, computed} from "mobx";
import {SyntheticEvent} from "react";
import {Todo} from "../store-domain/todo.class";

export class UIFooter {
    public indexStore: IndexStore = null;

    constructor(indexStore: IndexStore) {
        this.indexStore = indexStore;
    }

    @computed get location() {
        return this.indexStore.routerStore.location || {};
    }

    @computed get hide() {
        const { todoStore } = this.indexStore;
        return !todoStore.todoList.length;
    }

    @computed get uncompletedTodoCount() { return this.indexStore.todoStore.uncompletedTodoCount; }

}

export class UITodoList {
    public indexStore: IndexStore;

    constructor(indexStore: IndexStore) {
        this.indexStore = indexStore;
    }

    @computed get todoList() {
        const { routerStore, todoStore } = this.indexStore;
        if (!routerStore.location) { return null; }
        if (routerStore.location.pathname === "/completed") {
            return todoStore.completedTodoList;
        }
        if (routerStore.location.pathname === "/active") {
            return todoStore.uncompletedTodoList;
        }
        return todoStore.todoList;
    }

}

export class UITodo extends Todo {

    public static fromJSON(store: TodoStore, json: { id: number , value: string}) {
        const newTodo = new UITodo(json.id, store, json.value);
        Object.assign(newTodo, json);
        return newTodo;
    }

    @action.bound
    public save(e) {
        if (!this.editing) { return }
        this.toggleEditMode();
        this.value = e.target.value;
    }

    public onEditingBlur = (e) => {
        this.save(e);
    };

    public onEditingKeyPress = (e) => {
        if (e.key === "Enter") {
            this.save(e);
        }
    }
}

export class UITodoToggle {
    public indexStore: IndexStore;

    constructor(indexStore: IndexStore) {
        this.indexStore = indexStore;
    }

    get hide() {
        const { uiStore } = this.indexStore;
        return uiStore.footer.hide;
    }

    get checked() {
        return this.indexStore.todoStore.isAllTodoCompleted;
    }

    @action.bound
    public toggle(e: SyntheticEvent<HTMLInputElement>) {
        this.indexStore.todoStore.toggleAllTodo(e.currentTarget.checked);
    }
}
