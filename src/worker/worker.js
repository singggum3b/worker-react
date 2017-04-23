import "babel-polyfill";
import { match } from "toolbelt/common.belt";

import * as API from "./worker-api";
import store from "./store";

self.onmessage = function ({ data }) {
    const { api_name, ...rest } = data;
    match(api_name, {
        [API.API_CONST.INIT]: () => {
            console.log("initialize");
            store.subscribe(() => {
                const state = store.getState();
                postMessage({
                    api_name: API.API_CONST.STORE_UPDATE,
                    state: state,
                });
            })
        },
        [API.API_CONST.STORE_DISPATCH]: () => {
            store.dispatch(rest);
            console.log(rest);
        }
    }, () => {
        console.error("api_name is required");
    });
};