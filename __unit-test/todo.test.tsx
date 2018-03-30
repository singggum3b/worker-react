import { Todo } from "../src/store-domain/todo.class";
import { RemoveTodoAction } from "../src/saga/todo-action";
import {TodoStore} from "../src/store-domain/todo.store";

describe("Todo object", () => {

    const dispatchFn = jest.fn();
    const todo = new Todo(1, {
        dispatch: dispatchFn,
    } as TodoStore, "test");

    it("have correct properties", () => {
        expect(todo.completed).toBe(false);
        expect(todo.id).toBe(1);
        expect(todo.editing).toBe(false);
        expect(todo.toJSON()).toMatchObject({
            completed: false,
            id: 1,
            value: "test",
        });
    });

    it("dispatch correct action when remove", () => {
        todo.remove();
        expect(dispatchFn).toBeCalledWith(
            new RemoveTodoAction(todo),
        )
    });

});