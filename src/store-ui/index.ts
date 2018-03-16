import { observable, action, extendObservable, IObservableObject, IObservableValue } from 'mobx';
import { TodoStore } from '../store-domain/todo.store';

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

    @observable public footer: IObservableObject & UIFooter = null;
    @observable public todoToggle: IObservableObject = observable.object({});
    @observable public todoListComponent: IObservableObject = observable.object({});

    constructor(indexStore: IndexStore, dispatch: Function) {
        super(indexStore, dispatch);

        const { routerStore, todoStore } = indexStore;
        const uiStore = this;

        this.todoListComponent = {
            get todoList() {
                if (routerStore.location.pathname === '/completed') {
                    return todoStore.completedTodoList;
                }
                if (routerStore.location.pathname === '/active') {
                    return todoStore.uncompletedTodoList;
                }
                return todoStore.todoList;
            }
        };

        this.footer = observable.object(new UIFooter(indexStore));

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

class UIFooter {
    public location: Location = new Location();
    public todoStore: TodoStore = null;

    constructor(indexStore: IndexStore) {
        this.location =  indexStore.routerStore.location;
        this.todoStore = indexStore.todoStore;
    }

    get hide() {
        return !this.todoStore.todoList.length;
    }

    get uncompletedTodoCount() { return this.todoStore.uncompletedTodoCount; }

}

export class RouterStore extends BaseStore {

    public history: History;
    @observable public location: Location = new Location();

    constructor(indexStore: IndexStore, dispatch: Function) {
        super(indexStore, dispatch);
        this.history = indexStore.history;
    }

    @action
    public updateLocation(location: Location) {
        Object.assign(this.location, location);
    }
}