import React from "react";
import ReactDOM from "react-dom";
import DevTools from "mobx-react-devtools";
import { observer, Observer } from 'mobx-react';

import { Router, Route } from "react-router-dom";
import createBrowserHistory from "history/createBrowserHistory";


import IndexStore from "../store-ui/index";
import createSaga from "../saga";

import TodoList from "./components/todo-list";
import TodoInput from "./components/todo-input";
import TodoFooter from "./components/todo-footer";

import type { RouterStore } from "../store-ui/index";

const history = createBrowserHistory();
export const store = new IndexStore(createSaga, history);

function MobxRouterIntegration(props : { location: Object, store: RouterStore }) {
    props.store.updateLocation(props.location);
    return null;
}

export default function UI() {
    ReactDOM.render((
        <Router history={history}>
            <Route path="*" render={(props) => {
                return [
                    <App />,
                    <MobxRouterIntegration {...props} store={store.routerStore} />,
                ];
            }}/>
        </Router>
    ), document.getElementById("app"))
}

const App = observer(function App() {
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
                        <input id="toggle-all"
                               className="toggle-all"
                               type="checkbox"
                               checked={store.uiStore.todoToggle.checked}
                               onChange={store.uiStore.todoToggle.toggle}
                        />,
                        <label htmlFor="toggle-all">Mark all as complete</label>
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
    )
});