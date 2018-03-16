import {observable, computed, IObservableArray} from 'mobx';
import { AddTodoAction } from '../saga/todo-action';
import { Todo } from './todo.class';
import {IndexStore} from '../store-ui';

export class TodoStore {
    public indexStore: IndexStore;
    public dispatch: Function;
    @observable public todoList: IObservableArray<Todo> = observable.array([]);

    constructor(indexStore: IndexStore, dispatch: Function) {
        this.indexStore = indexStore;
        this.dispatch = dispatch;
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

    public toggleAllTodo = (flag: boolean) => {
        this.todoList.forEach((item: Todo) => item.completed = flag);
    };

    public clearCompletedTodo = () => {
        this.todoList.replace(this.todoList.filter(i => !i.completed));
    };

    public addTodo = (value: string) => {
        if (value === '') {
            return;
        }
        this.todoList.push(new Todo(Date.now(), this.indexStore.todoStore, value));
        // this.dispatch(new AddTodoAction(value, this));
    };

    public removeTodo = (item: Todo) => {
        this.todoList.replace(this.todoList.filter(i => i !== item));
    }
}