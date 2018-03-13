import { observable, action, extendObservable } from "mobx";
import TodoStore from '../store-domain/todo.store'

export class BaseStore {
    indexStore: IndexStore;
    dispatch;

    constructor(indexStore: IndexStore, dispatch: Function) {
        this.indexStore = indexStore;
        this.dispatch = dispatch;
    }
}

export default class IndexStore {
    todoStore: TodoStore;
    uiStore: UIStore;
    routerStore: RouterStore;
    dispatch: Function;
    history: Object;

    constructor(createSaga, history) {
        const { dispatch } = createSaga(this);
        this.dispatch = dispatch;
        this.history = history;
        this.routerStore = new RouterStore(this, dispatch);
        this.todoStore = new TodoStore(this, dispatch);
        this.uiStore = new UIStore(this, dispatch);
    }

}

export class UIStore extends BaseStore {

    @observable footer = {};
    @observable todoToggle = {};

    constructor(indexStore: IndexStore, dispatch: Function) {
        super(indexStore, dispatch);

        const { routerStore, todoStore } = indexStore;
        const uiStore = this;

        this.footer = {
            location: routerStore.location,
            get hide() {
                return !todoStore.todoList.length;
            },
            get uncompletedTodoCount() { return indexStore.todoStore.uncompletedTodoCount },
        };

        this.todoToggle = {
            get hide() {
                return uiStore.footer.hide;
            },
            get checked() {
                return indexStore.todoStore.isAllTodoCompleted;
            },
            toggle(e) {
                indexStore.todoStore.toggleAllTodo(e.target.checked);
            },
        }

    }

}

export class RouterStore extends BaseStore {

    history;
    @observable location = {
        pathname: "",
        key: "",
        hash: "",
        state: "",
        search: "",
    };

    constructor(indexStore: IndexStore, dispatch: Function) {
        super(indexStore, dispatch);
        this.history = indexStore.history;
    }

    @action
    updateLocation(location) {
        Object.assign(this.location, location);
    }
}