import "babel-polyfill";
import "whatwg-fetch";
import { match } from "toolbelt/common.belt";

import * as API from "./worker-api";
import store from "./store";

self.onmessage = function ({ data }) {
    const { api_name, ...rest } = data;
    match(api_name, {
        [API.API_CONST.INIT]: () => {
            store.subscribe(() => {
                const state = store.getState();
                outStoreUpdate(state);
            });
            outInitDone(store.getState());
        },
        [API.API_CONST.STORE_DISPATCH]: () => {
            store.dispatch(rest);
            console.log(rest);
        }
    }, () => {
        console.error("api_name is required");
    });
};

function outInitDone(state) {
    postMessage({
        api_name: API.API_CONST.INIT_DONE,
        state: state,
    });
}

function outStoreUpdate(state) {
    postMessage({
        api_name: API.API_CONST.STORE_UPDATE,
        state: state,
    });
}