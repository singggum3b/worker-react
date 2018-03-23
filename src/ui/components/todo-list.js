import React from "react";
import { reaction, observe } from "mobx";
import { observer } from "mobx-react";
import classnames from "classnames";

import type { UITodo } from "../../store-ui/ui-model";

type Props = {
    todo: UITodo,
}

@observer
class TodoItem extends React.Component<Props> {

    componentDidUpdate() {
        if (!this.prevEditing && this.props.todo.editing) {
            this.editingInput.focus();
        }
        this.prevEditing = this.props.todo.editing;
    }

    render() {
        const { todo } = this.props;
        const cls = classnames("item", {
            "completed": todo.completed,
            "editing": todo.editing,
        });

        return (
            <li className={cls} >
                <div className="view">
                    <input className="toggle"
                           type="checkbox"
                           checked={todo.completed}
                           onChange={todo.toggleCompleted}
                    />
                    <label onDoubleClick={todo.toggleEditMode} >{todo.value}</label>
                    <button className="destroy" onClick={todo.remove}></button>
                </div>
                <input
                    key="edit-input"
                    ref={(el) => this.editingInput = el}
                    className="edit"
                    defaultValue={todo.value}
                    onBlur={todo.onEditingBlur}
                    onKeyUp={todo.onEditingKeyPress}
                />
            </li>
        );
    }
}

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