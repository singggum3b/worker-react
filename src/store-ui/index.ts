import { observable, action, extendObservable, IObservableObject, IObservableValue } from 'mobx';
import { TodoStore } from '../store-domain/todo.store';
import {UIFooter, UITodoList, UITodoToggle} from './ui-model';

export class BaseStore {
    public indexStore: IndexStore;
    public dispatch: Function;

    constructor(indexStore: IndexStore, dispatch: Function) {
        this.indexStore = indexStore;
        this.dispatch = dispatch;
    }
}

export class IndexStore {
    public todoStore: TodoStore;
    public uiStore: UIStore;
    public routerStore: RouterStore;
    public dispatch: Function;
    public history: History;

    constructor(createSaga: Function, history: History) {
        const { dispatch } = createSaga(this);
        this.dispatch = dispatch;
        this.history = history;
        this.routerStore = new RouterStore(this, dispatch);
        this.todoStore = new TodoStore(this, dispatch);
        this.uiStore = new UIStore(this, dispatch);
    }

}

export class UIStore extends BaseStore {

    @observable public footer: UIFooter = new UIFooter(this.indexStore);
    @observable public todoToggle: UITodoToggle = new UITodoToggle(this.indexStore);
    @observable public todoListComponent: UITodoList = new UITodoList(this.indexStore);

    constructor(indexStore: IndexStore, dispatch: Function) {
        super(indexStore, dispatch);
    }

}

export class RouterStore extends BaseStore {

    public history: History;
    @observable public location: Location = null;

    constructor(indexStore: IndexStore, dispatch: Function) {
        super(indexStore, dispatch);
        this.history = indexStore.history;
    }

    @action
    public updateLocation(location: Location) {
        if (!this.location) {
            this.location = location;
        } else {
            Object.assign(this.location, location);
        }
    }
}