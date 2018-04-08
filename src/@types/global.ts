interface IAction {
    type: any,
    [x: string]: any
}

type IDispatch = (action: IAction) => void

declare var __MOBX_DEVTOOLS_GLOBAL_HOOK__: any;

type JSONValue = string | number | boolean | IJSONObject | IJSONArray;

interface IJSONObject {
    [x: string]: JSONValue;
}

interface IJSONArray extends Array<JSONValue> {}

type OnlyJSONName<T> = { [K in keyof T]: T[K] extends JSONValue ? K : never }[keyof T];
type OnlyJSON<T> = Pick<T, OnlyJSONName<T>>;
