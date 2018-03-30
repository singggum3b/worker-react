import * as React from "react";
import { observer } from "mobx-react";
import * as classnames from "classnames";

import { UITodo } from "../../store-ui/ui-model";
import {merge, Stream} from "most";
import {create, ISelfEmitStream} from "../../utils/most";
import {computed} from "mobx";
import {Todo} from "../../store-domain/todo.class";

interface IProps {
    todo: UITodo,
}

@observer
class TodoItem extends React.Component<IProps> {

    public displayName = "TodoItem";

    private componentDidUpdateStream: ISelfEmitStream<boolean>;
    private inputBlurStream: ISelfEmitStream<string>;
    private inputKeyPressStream: ISelfEmitStream<any>;
    private saveStream: Stream<string>;
    private inputDom: HTMLInputElement;

    @computed get todo(): Todo {
        return this.props.todo.getRoot();
    }

    constructor(props) {
        super(props);

        this.componentDidUpdateStream = create("componentDidUpdateStream");
        this.inputBlurStream = create("inputBlurStream");
        this.inputKeyPressStream = create("inputKeyPressStream");

        // Save event
        this.saveStream = merge(
            this.inputBlurStream.filter(() => this.todo.editing),
            this.inputKeyPressStream.filter((e) => {
                return this.todo.editing && e.key === "Enter";
            }).map(e => e.value),
        );

        // Focus input on editing
        this.componentDidUpdateStream.scan((prevEditing: boolean, isEditing: boolean) => {
            return !prevEditing && isEditing;
        }, false).filter(Boolean).observe(() => {
            this.inputDom.focus();
        });

        // Restore value on Escape
        this.inputKeyPressStream.filter((e) => {
            return this.todo.editing && e.key === "Escape";
        }).observe((e) => {
            // Uncontrolled input need this to reset value
            if (this.inputDom) {
                this.inputDom.value = this.todo.value;
            }
            this.todo.toggleEditMode();
        });

        // Save - skipp equal
        this.saveStream.skipRepeats().observe((v) => {
            this.todo.save(v);
        });

        // Remove on clear vaue
        this.saveStream.filter(v => !v || v === "")
            .observe(() => this.todo.remove());

        // Cancel edit mode
        this.saveStream.observe((v) => {
            this.todo.toggleEditMode();
        });

    }

    public componentDidUpdate() {
        this.componentDidUpdateStream.emit(this.todo.editing);
    }

    public inputBlur = (e) => {
        this.inputBlurStream.emit(e.target.value);
    };

    public inputKeyPress = (e) => {
        this.inputKeyPressStream.emit({
            value: e.target.value,
            key: e.key,
        });
    };

    public render() {
        const todo = this.todo;
        const cls = classnames("item", {
            completed: todo.completed,
            editing: todo.editing,
        });

        return (
            <li className={cls} >
                <div className="view">
                    <input
                        className="toggle"
                        type="checkbox"
                        checked={todo.completed}
                        onChange={todo.toggleCompleted}
                    />
                    <label onDoubleClick={todo.toggleEditMode} >{todo.value}</label>
                    <button className="destroy" onClick={todo.remove} />
                </div>
                <input
                    key="edit-input"
                    ref={(el) => (this.inputDom = el)}
                    className="edit"
                    defaultValue={todo.value}
                    onBlur={this.inputBlur}
                    onKeyUp={this.inputKeyPress}
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
