interface IAction {
    type: any,
    [x: string]: any
}

type IDispatch = (action: IAction) => void

declare var process: {
    env: {
        NODE_ENV: "production" | "development",
    };
};

declare var __MOBX_DEVTOOLS_GLOBAL_HOOK__: any;
