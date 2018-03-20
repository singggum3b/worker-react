interface IAction {
    type: string
}

type IDispatch = (action: IAction) => void
