interface IAction {
    type: any,
    [x: string]: any
}

type IDispatch = (action: IAction) => void
