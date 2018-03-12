import { observable } from "mobx";
import TodoStore from '../store-domain/todo.store'

export default class IndexStore {
    todoStore: TodoStore;
    uiStore: UIStore;
    dispatch;

    constructor(createSaga) {
        const { dispatch } = createSaga(this);
        this.dispatch = dispatch;
        this.todoStore = new TodoStore(this, dispatch);
        this.uiStore = new UIStore(this, dispatch);
    }

}

export class UIStore {
    indexStore: IndexStore;
    dispatch;

    @observable footer = {};
    @observable todoToggle = {};

    constructor(indexStore: IndexStore, dispatch: Function) {
        const uiStore = this;
        this.indexStore = indexStore;
        this.dispatch = dispatch;

        this.footer = {
            get hide() { return !indexStore.todoStore.todoList.length },
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