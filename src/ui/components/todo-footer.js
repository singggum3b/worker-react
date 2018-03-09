import React from "react";
import { observer } from 'mobx-react';

import type TodoStore from "../../store-domain/todo.class";

export type Props = {
    uncompletedTodoCount: number,
    clearCompletedTodo: Function,
}

const TodoFooter = observer(({ uncompletedTodoCount, clearCompletedTodo } : Props) => {
    return (
        <footer className="footer">
            {/*<!-- This should be `0 items left` by default -->*/}
            <span className="todo-count"><strong>{uncompletedTodoCount}</strong> item left</span>
            {/*<!-- Remove this if you don't implement routing -->*/}
            <ul className="filters">
                <li>
                    <a className="selected" href="#/">All</a>
                </li>
                <li>
                    <a href="#/active">Active</a>
                </li>
                <li>
                    <a href="#/completed">Completed</a>
                </li>
            </ul>
            {/*<!-- Hidden if no completed items are left ↓ -->*/}
            <button className="clear-completed" onClick={clearCompletedTodo}>Clear completed</button>
        </footer>
    )
});

TodoFooter.displayName = "TodoFooter";

export default TodoFooter;