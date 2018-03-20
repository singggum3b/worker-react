import React from "react";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";

export type Props = {
    state: {
        location: Object,
        uncompletedTodoCount: number,
        hide: boolean,
    },
    clearCompletedTodo: Function,
}

const TodoFooter = observer((props : Props) => {
    if (props.state.hide) {
        return null;
    }
    return (
        <footer className="footer" data-path={props.state.location.pathname}>
            {/*<!-- This should be `0 items left` by default -->*/}
            <span className="todo-count"><strong>{props.state.uncompletedTodoCount}</strong> item left</span>
            {/*<!-- Remove this if you don"t implement routing -->*/}
            <ul className="filters">
                <li>
                    <NavLink activeClassName="selected" to="/" exact >All</NavLink>
                </li>
                <li>
                    <NavLink activeClassName="selected" to="/active" exact>Active</NavLink>
                </li>
                <li>
                    <NavLink activeClassName="selected" to="/completed" exact>Completed</NavLink>
                </li>
            </ul>
            {/*<!-- Hidden if no completed items are left ↓ -->*/}
            <button className="clear-completed" onClick={props.clearCompletedTodo}>Clear completed</button>
        </footer>
    )
});

TodoFooter.displayName = "TodoFooter";

export default TodoFooter;