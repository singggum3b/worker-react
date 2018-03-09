import React, { Component } from "react";
import { observer } from 'mobx-react';

import type TodoStore from "../../store-domain/todo.store";

type Props = {
    addTodo: Function,
}

export default class TodoInput extends Component<Props> {

    static defaultProps = {
        defaultClassName: "new-todo",
    };

    static displayName = "TodoInput";

    addTodo = (e) => {
        if (e.key === "Enter") {
            this.props.addTodo(e.target.value);
        }
    };

    render() {
        return (
            <input
                className={TodoInput.defaultProps.defaultClassName}
                placeholder="What needs to be done?" autoFocus
                onKeyUp={this.addTodo}
            />
        );
    }
}
