import { TodoStore } from "../src/store-domain/todo.store";
import {Todo} from "../src/store-domain/todo.class";
import {IndexStore} from "../src/store-ui";

beforeAll(() => {
    const storage = {};
    global.localStorage = {
        getItem: jest.fn().mockImplementation((key) => {
            return JSON.stringify(storage[key]);
        }),
        setItem: jest.fn().mockImplementation((key, value) => {
            storage[key] = value;
        }),
    };
});

describe("Todo store", () => {

    it("load todoList from storage on create", () => {
        const todoStore = new TodoStore({} as IndexStore);
        expect(localStorage.getItem).toBeCalledWith(TodoStore.STORAGE_KEY);
    });

    it("save todoList to storage on changes", () => {
        const todoStore = new TodoStore({} as IndexStore);
        const sampleTodo = new Todo(1, todoStore, "test1");
        todoStore.addTodo(sampleTodo);
        expect(localStorage.setItem).toBeCalledWith(TodoStore.STORAGE_KEY, JSON.stringify(
            [{id: 1, value: "test1", completed: false}],
        ));
        todoStore.removeTodo(sampleTodo);
        expect(localStorage.setItem).toBeCalledWith(TodoStore.STORAGE_KEY, JSON.stringify(
            [],
        ));
    })

});
