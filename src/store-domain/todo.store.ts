import { observable, computed, IObservableArray, action, reaction } from "mobx";
import { Todo } from "./todo.class";
import { IndexStore } from "../store-ui";
import {UITodo} from "../store-ui/ui-model";

export class TodoStore {

    public static readonly STORAGE_KEY: string = "todoList";

    private static saveToStorage(json: object) {
        localStorage.setItem(TodoStore.STORAGE_KEY, JSON.stringify(json));
    }

    public indexStore: IndexStore;

    @observable public todoList: IObservableArray<Todo> = observable.array([]);

    constructor(indexStore: IndexStore) {

        this.indexStore = indexStore;

        this.loadFromStorage();

        const disposer = reaction(() => {
            return this.toJSON();
        }, (json) => {
            TodoStore.saveToStorage(json);
        }, {
            name: "saveTodoStorage",
        });

    }

    @computed get uncompletedTodoCount() {
        return this.todoList.reduce((result, todo: Todo) => {
            return todo.completed ? result : result + 1;
        }, 0);
    }

    @computed get isAllTodoCompleted() {
        return !this.todoList.some((item: Todo) => !item.completed);
    }

    @computed get completedTodoList() {
        return this.todoList.filter((item: Todo) => {
            return item.completed;
        });
    }

    @computed get uncompletedTodoList() {
        return this.todoList.filter((item: Todo) => {
            return !item.completed;
        });
    }

    @action
    public toggleAllTodo = (flag: boolean) => {
        this.todoList.forEach((item: Todo) => item.completed = flag);
    };

    @action
    public clearCompletedTodo = () => {
        this.todoList.replace(this.todoList.filter(i => !i.completed));
    };

    @action
    public addTodo = (value: string | Todo) => {
        if (value instanceof Todo) {
            return this.todoList.push(value);
        }
        if (value === "") {
            return;
        }
        return this.todoList.push(new Todo(Date.now(), this.indexStore.todoStore, value));
        // this.dispatch(new AddTodoAction(value, this));
    };

    @action
    public removeTodo = (item: Todo) => {
        this.todoList.replace(this.todoList.filter(i => i !== item));
    };

    @action
    public fromJSON(json: any[]) {
        this.todoList.replace(json.map(item => Todo.fromJSON(this, item)));
    }

    public toJSON() {
        return this.todoList.map(todo => todo.toJSON());
    }

    public loadFromStorage() {
        try {
            const data = localStorage.getItem(TodoStore.STORAGE_KEY);
            if (!data) {
                console.info("No todo data to load");
                return;
            }
            const localTodo = JSON.parse(data);
            this.fromJSON(localTodo);
        } catch (e) {
            console.error("Load local todos failed", e);
        }
    }

}
