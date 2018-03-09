import TodoStore from '../store-domain/todo.store';
import Todo from "../store-domain/todo.class";

export class AddTodoAction {
    static type = "ADD_TODO";
    context: TodoStore;
    value: string;
    type: string = AddTodoAction.type;

    constructor(value: string, context: TodoStore) {
        this.value = value;
        this.context = context;
    }
}

export class RemoveTodoAction {
    static type = "REMOVE_TODO";
    context: TodoStore;
    todo: Todo;
    type: string = RemoveTodoAction.type;

    constructor(todo: Todo) {
        this.todo = todo;
        this.context = todo.store;
    }
}