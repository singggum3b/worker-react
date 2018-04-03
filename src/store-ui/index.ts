import { observable, action } from "mobx";
import { TodoStore } from "../store-domain/todo.store";
import {UIFooter, UITodoList, UITodoToggle} from "./ui-model";
import { History } from "history";

export class BaseStore {
    public indexStore: IndexStore;

    constructor(indexStore: IndexStore) {
        this.indexStore = indexStore;
    }
}

export class IndexStore {
    public todoStore: TodoStore;
    public uiStore: UIStore;
    public routerStore: RouterStore;
    public history: History;

    constructor(history: History) {
        this.history = history;
        this.routerStore = new RouterStore(this);
        this.todoStore = new TodoStore(this);
        this.uiStore = new UIStore(this);
    }

}

export class UIStore extends BaseStore {

    @observable public footer: UIFooter = new UIFooter(this.indexStore);
    @observable public todoToggle: UITodoToggle = new UITodoToggle(this.indexStore);
    @observable public todoListComponent: UITodoList = new UITodoList(this.indexStore);

    constructor(indexStore: IndexStore) {
        super(indexStore);
    }

}

export class RouterStore extends BaseStore {

    public history: History;
    @observable public location: Location | null = null;

    constructor(indexStore: IndexStore) {
        super(indexStore);
        this.history = indexStore.history;
    }

    @action
    public updateLocation(location: Location): void {
        if (!this.location) {
            this.location = location;
        } else {
            Object.assign(this.location, location);
        }
    }
}
