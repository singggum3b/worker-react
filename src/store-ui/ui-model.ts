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

    public componentDidUpdateStream: ISelfEmitStream<boolean>;
    public inputBlurStream: ISelfEmitStream<string>;
    public inputKeyPressStream: ISelfEmitStream<any>;
    public saveStream: Stream<string>;
    public inputDom: HTMLInputElement;

    @action.bound
    public save(v) {
        // if (!this.editing) { return }
        // this.toggleEditMode();
        if (v !== this.value) {
            this.value = v;
        }
    }

    public componentDidUpdate(editing: boolean) {
        this.componentDidUpdateStream.emit(editing);
    }

    public inputBlur = (e) => {
        this.inputBlurStream.emit(e.target.value);
    };

    public inputKeyPress = (e) => {
        this.inputKeyPressStream.emit({
            value: e.target.value,
            key: e.key,
        });
    };

    protected init() {
        this.componentDidUpdateStream = create("componentDidUpdateStream");
        this.inputBlurStream = create("inputBlurStream");
        this.inputKeyPressStream = create("inputKeyPressStream");

        // Focus input on editing
        this.componentDidUpdateStream.scan((prevEditing: boolean, isEditing: boolean) => {
            return !prevEditing && isEditing;
        }, false).filter(Boolean).observe(() => {
            this.inputDom.focus();
        });

        // Restore value on Escape
        this.inputKeyPressStream.filter((e) => {
            return this.editing && e.key === "Escape";
        }).observe((e) => {
            // Uncontrolled input need this to reset value
            if (this.inputDom) {
                this.inputDom.value = this.value;
            }
            this.toggleEditMode();
        });

        // Save event
        this.saveStream = merge(
            this.inputBlurStream.filter(() => this.editing),
            this.inputKeyPressStream.filter((e) => {
                return this.editing && e.key === "Enter";
            }).map(e => e.value),
        );

        // Save - skipp equal
        this.saveStream.skipRepeats().observe((v) => {
            this.save(v);
        });

        // Remove on clear vaue
        this.saveStream.filter(v => !v || v === "").observe(() => this.store.removeTodo(this));

        // Cancel edit mode
        this.saveStream.observe((v) => {
            this.toggleEditMode();
        })
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
