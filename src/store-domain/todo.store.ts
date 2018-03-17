import { observable, computed, IObservableArray, action, reaction, toJS } from 'mobx';
import { AddTodoAction } from '../saga/todo-action';
import { Todo } from './todo.class';
import { IndexStore } from '../store-ui';

export class TodoStore {
    public indexStore: IndexStore;
    public dispatch: Function;

    private static readonly STORAGE_KEY: string = 'todoList';

    private static saveToStorage(json: object) {
        localStorage.setItem(TodoStore.STORAGE_KEY, JSON.stringify(json));
    }

    @observable public todoList: IObservableArray<Todo> = observable.array([]);

    constructor(indexStore: IndexStore, dispatch: Function) {

        this.indexStore = indexStore;
        this.dispatch = dispatch;

        this.loadFromStorage();

        const disposer = reaction(() => {
            return this.toJSON();
        }, (json) => {
            TodoStore.saveToStorage(json);
        }, {
            name: 'saveTodoStorage',
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
    public addTodo = (value: string) => {
        if (value === '') {
            return;
        }
        this.todoList.push(new Todo(Date.now(), this.indexStore.todoStore, value));
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
            const localTodo = JSON.parse(localStorage.getItem(TodoStore.STORAGE_KEY));
            this.fromJSON(localTodo);
        } catch (e) {
            console.warn('Load local todos failed');
        }
    }
}