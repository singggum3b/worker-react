import { observable } from 'mobx';
import TodoStore from "./todo.store";
import { RemoveTodoAction } from "../saga/todo-action";

export default class Todo {
    id: number;
    store: TodoStore;
    @observable value = '';
    @observable completed = false;
    @observable editing = false;
    @observable focused = false;

    constructor(id: number, store: TodoStore, value: string) {
        this.id = id;
        this.store = store;
        this.value = value;
    }

    toggleCompleted = (e: ReactDOM.Event) => {
        this.completed = !!e.target.checked;
    };

    remove = () => {
        this.store.dispatch(new RemoveTodoAction(this));
    }
}