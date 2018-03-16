import { observable } from 'mobx';
import TodoStore from './todo.store';
import { RemoveTodoAction } from '../saga/todo-action';
import {InputHTMLAttributes, SyntheticEvent} from 'react';

export class Todo {
    public id: number;
    private store: TodoStore;
    @observable public value: string = '';
    @observable public completed: boolean = false;
    @observable public editing: boolean = false;
    @observable public focused: boolean = false;

    constructor(id: number, store: TodoStore, value: string) {
        this.id = id;
        this.store = store;
        this.value = value;
    }

    public toggleCompleted = (e: SyntheticEvent<HTMLInputElement>) => {
        this.completed = e.currentTarget.checked;
    };

    public remove = () => {
        this.store.dispatch(new RemoveTodoAction(this));
    }
}