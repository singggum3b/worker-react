import React from "react";
import ReactDOM from "react-dom";

import { Provider } from "react-redux";

import Counter from "./components/counter";

export default function UI({ store }) {
    ReactDOM.render(<App store={store} />, document.getElementById("app"))
}

function App({ store }) {
    return (
        <Provider store={store}>
            <Counter />
        </Provider>
    )
}