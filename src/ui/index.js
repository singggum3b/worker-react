import React from "react";
import ReactDOM from "react-dom";
import { observer } from 'mobx-react';
import DevTools from "mobx-react-devtools";

import IndexStore from "../store-ui/index";
import createSaga from "../saga";

import Counter from "./components/counter";
import TodoList from "./components/todo-list";
import TodoInput from "./components/todo-input";
import TodoFooter from "./components/todo-footer";

export const store = new IndexStore(createSaga);

export default function UI() {
    ReactDOM.render(<App />, document.getElementById("app"))
}

function App() {
    return (
        <section className="todoapp" >
            {/*<Counter key="counter" data={store.tripStore.tripList} />*/}
            <header className="header">
                <h1>todos</h1>
                <TodoInput addTodo={store.todoStore.addTodo} />
            </header>
            <section className="main">
                <input id="toggle-all" className="toggle-all" type="checkbox" />
                <label htmlFor="toggle-all">Mark all as complete</label>
                <TodoList key="todolist" todoList={store.todoStore.todoList} />
            </section>
            <TodoFooter
                {...store.todoStore.footerState}
            />
            <DevTools/>
        </section>
    )
}