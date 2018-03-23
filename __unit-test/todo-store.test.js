import { TodoStore } from "../src/store-domain/todo.store";
import { UITodo } from "../src/store-ui/ui-model";

describe("Todo store", () => {

    const storage = {};
    global.localStorage = {
        getItem: jest.fn().mockImplementation((key) => {
            return storage[key];
        }),
        setItem: jest.fn().mockImplementation((key, value) => {
            storage[key] = value;
        }),
    };

    const dispatch = jest.fn();
    const todoStore = new TodoStore({}, dispatch);

    it("has correct properties", () => {

    });

    it("load todoList from storage on create", () => {
        expect(localStorage.getItem).toBeCalledWith(TodoStore.STORAGE_KEY);
    });

    it("save todoList to storage on changes", () => {
        const sampleTodo = new UITodo(1, todoStore, 'test1');
        todoStore.addTodo(sampleTodo);
        expect(localStorage.setItem).toBeCalledWith(TodoStore.STORAGE_KEY, JSON.stringify(
            [{id: 1, value: 'test1', completed: false}]
        ));
        todoStore.removeTodo(sampleTodo);
        expect(localStorage.setItem).toBeCalledWith(TodoStore.STORAGE_KEY, JSON.stringify(
            []
        ));
    })

});