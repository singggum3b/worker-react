import * as React from "react";
import {TodoStore} from "../../store-domain/todo.store";

interface IProps {
    addTodo: typeof TodoStore.prototype.addTodo,
}

export default class TodoInput extends React.Component<IProps> {

    public static defaultProps = {
        defaultClassName: "new-todo",
    };

    public static displayName = "TodoInput";

    public render(): React.ReactNode {
        return (
            <input
                className={TodoInput.defaultProps.defaultClassName}
                placeholder="What needs to be done ?" autoFocus
                onKeyUp={this.addTodo}
            />
        );
    }

    private addTodo = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
            this.props.addTodo(e.currentTarget.value);
        }
    };
}
