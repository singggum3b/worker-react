import React from "react";
import { observer } from 'mobx-react';

import type Todo from "../../store-domain/todo.class";

const TodoItem = observer(({ todo } : { todo: Todo }) => {
    return (
        <li className={todo.completed ? "completed" : ''}>
            <div className="view">
                <input className="toggle" type="checkbox" checked={todo.completed} onChange={todo.toggleCompleted} />
                <label>{todo.value}</label>
                <button className="destroy" onClick={todo.remove}></button>
            </div>
            <input className="edit" defaultValue={todo.value} />
        </li>
    )
});

TodoItem.displayName = "TodoItem";

const TodoList = observer(({ todoList, className, defaultClassName }) => {
    if (!todoList) return null;
    return (
        <ul className={defaultClassName + " " + (className || "")}>
            {
                todoList.map((todo: Todo) => {
                    return <TodoItem key={todo.id} todo={todo} />
                })
            }
        </ul>
    )
});

TodoList.defaultProps = {
    defaultClassName: "todo-list",
};

TodoList.displayName = "TodoList";

export default TodoList;