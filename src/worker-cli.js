import * as API from "./worker/worker-api";

function handleInitDone(resolve) {
    return ({ data }) => {
        const { api_name, ...rest } = data;
        if (api_name === API.API_CONST.INIT_DONE) {
            resolve(rest);
        }
    }
}

export default function WorkerCLI(worker) {
    let lastState = {};

    return {
        init: () => {
            return new Promise((resolve) => {
                worker.addEventListener("message", handleInitDone(resolve));
                worker.postMessage({
                    api_name: API.API_CONST.INIT,
                });
            }).then((initData) => {
                worker.removeEventListener("message", handleInitDone);
                lastState = initData.state;
            });
        },
        store: {
            dispatch: (action) => {
                action.api_name = API.API_CONST.STORE_DISPATCH;
                worker.postMessage({
                    api_name: API.API_CONST.STORE_DISPATCH,
                    ...action,
                });
                return action;
            },
            subscribe: (handler) => {
                worker.addEventListener("message", ({ data }) => {
                    if (data.api_name === API.API_CONST.STORE_UPDATE) {
                        lastState = data.state;
                        handler(data.state);
                    }
                });
                return () => {
                }
            },
            getState() {
                return lastState;
            }
        }
    }
}