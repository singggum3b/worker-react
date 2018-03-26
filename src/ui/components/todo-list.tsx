import * as React from "react";
import { observer } from "mobx-react";
import * as classnames from "classnames";

import { UITodo } from "../../store-ui/ui-model";

interface IProps {
    todo: UITodo,
}

@observer
class TodoItem extends React.Component<IProps> {

    public displayName = "TodoItem";

    public componentDidUpdate() {
        this.props.todo.componentDidUpdate(this.props.todo.editing);
    }

    public render() {
        const { todo } = this.props;
        const cls = classnames("item", {
            completed: todo.completed,
            editing: todo.editing,
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
                    ref={(el) => (todo.inputDom = el)}
                    className="edit"
                    defaultValue={todo.value}
                    onBlur={todo.inputBlur}
                    onKeyUp={todo.inputKeyPress}
                />
            </li>
        );
    }
}

interface ITodoListProps {
    todoList: UITodo[],
    className?: string,
    defaultClassName?: string
}

const TodoList: React.StatelessComponent<ITodoListProps> = observer(({ todoList, className, defaultClassName }) => {
    if (!todoList) {
        return null;
    }
    return (
        <ul className={defaultClassName + " " + (className || "")}>
            {
                todoList.map((todo: UITodo) => {
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
