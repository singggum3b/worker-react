import {IndexStore} from "./index";
import {TodoStore} from "../store-domain/todo.store";
import {action, computed} from "mobx";
import {InputHTMLAttributes, SyntheticEvent} from "react";
import {Todo} from "../store-domain/todo.class";
import {create, ISelfEmitStream} from "../utils/most";
import {merge, Stream} from "most";

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

    @computed get todoList(): UITodo[] {
        const { routerStore, todoStore } = this.indexStore;
        let result;
        if (!routerStore.location) { return null; }
        if (routerStore.location.pathname === "/completed") {
            result = todoStore.completedTodoList;
        } else if (routerStore.location.pathname === "/active") {
            result = todoStore.uncompletedTodoList;
        } else {
            result = todoStore.todoList;
        }

        return result.map(todo => UITodo.fromTodo(todo))
    }

}

export class UITodo {

    public static fromTodo(t: Todo) {
        if (this.uiTodoList.has(t)) {
            return this.uiTodoList.get(t);
        }
        const newUITodo = new UITodo(t);
        this.uiTodoList.set(t, newUITodo);
        return newUITodo;
    }

    private static uiTodoList: WeakMap<Todo, UITodo> = new WeakMap<Todo, UITodo>();

    private todo: Todo;

    private constructor(t: Todo) {
        this.todo = t;
    }

    @computed get id() {
        return this.todo.id;
    }

    public getRoot() {
        return this.todo;
    }

}

export class UITodoToggle {
    public indexStore: IndexStore;

    constructor(indexStore: IndexStore) {
        this.indexStore = indexStore;
    }

    @computed get hide() {
        const { uiStore } = this.indexStore;
        return uiStore.footer.hide;
    }

    @computed get checked() {
        return this.indexStore.todoStore.isAllTodoCompleted;
    }

    @action.bound
    public toggle(e: SyntheticEvent<HTMLInputElement>) {
        this.indexStore.todoStore.toggleAllTodo(e.currentTarget.checked);
    }
}
