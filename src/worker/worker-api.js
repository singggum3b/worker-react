export const API_CONST = {
    // INPUT
    INIT: "INIT",
    STORE_DISPATCH: "STORE_DISPATCH",
    // OUTPUT
    INIT_DONE: "INIT_DONE",
    STORE_UPDATE: "STORE_UPDATE",
};

export function init() {
    return {
        type: API_CONST.INIT,
    }
}