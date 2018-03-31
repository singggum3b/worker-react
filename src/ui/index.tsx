import * as React from "react";
import * as ReactDOM from "react-dom";
import DevTools from "mobx-react-devtools";
import { observer, Observer } from "mobx-react";

import { Router, Route } from "react-router-dom";
import { createBrowserHistory } from "history";

import { IndexStore } from "../store-ui";

import TodoList from "./components/todo-list";
import TodoInput from "./components/todo-input";
import TodoFooter from "./components/todo-footer";
import { MobxRouterIntegration } from "./mobx-router";

const history = createBrowserHistory();
export const store = new IndexStore(history);

function wrapper(props) {
    return [
        <APP key="app" />,
        <MobxRouterIntegration key="mri" {...props} store={store} />,
    ];
}

export function UI() {
    ReactDOM.render((
        <Router history={history}>
            <Route
                path="*"
                render={wrapper}
            />
        </Router>
    ), document.getElementById("app"));
}

const APP = observer(function App() {
    return (
        <section className="todoapp" >
            {/*<Counter key="counter" data={store.tripStore.tripList} />*/}
            <header className="header">
                <h1>todos</h1>
                <TodoInput addTodo={store.todoStore.addTodo} />
            </header>
            <section className="main">
                <Observer>
                    {() => (
                    !store.uiStore.todoToggle.hide && [
                        <input key="toggle-button" id="toggle-all"
                               className="toggle-all"
                               type="checkbox"
                               checked={store.uiStore.todoToggle.checked}
                               onChange={store.uiStore.todoToggle.toggle}
                        />,
                        <label key="toggle-button-label" htmlFor="toggle-all">Mark all as complete</label>
                    ]
                    )}
                </Observer>
                <TodoList key="todolist" todoList={store.uiStore.todoListComponent.todoList} />
            </section>
            <TodoFooter
                state={store.uiStore.footer}
                clearCompletedTodo={store.todoStore.clearCompletedTodo}
            />
            <DevTools/>
        </section>
    );
});