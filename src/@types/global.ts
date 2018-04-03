interface IAction {
    type: any,
    [x: string]: any
}

type IDispatch = (action: IAction) => void

declare var __MOBX_DEVTOOLS_GLOBAL_HOOK__: any;
