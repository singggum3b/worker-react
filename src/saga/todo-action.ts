import {TodoStore} from "../store-domain/todo.store";
import {Todo} from "../store-domain/todo.class";

export class AddTodoAction {
    public static readonly type: string = "ADD_TODO";
    public context: TodoStore;
    public value: string;
    public type: string = AddTodoAction.type;

    constructor(value: string, context: TodoStore) {
        this.value = value;
        this.context = context;
    }
}

export class RemoveTodoAction {
    public static readonly type: string = "REMOVE_TODO";
    public context: TodoStore;
    public todo: Todo;
    public type: string = RemoveTodoAction.type;

    constructor(todo: Todo) {
        this.todo = todo;
        this.context = todo.store;
    }
}
