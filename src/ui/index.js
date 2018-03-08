import React from "react";
import ReactDOM from "react-dom";
import { observer } from 'mobx-react';

import Counter from "./components/counter";

export default function UI({ store }) {
    ReactDOM.render(<App store={store} />, document.getElementById("app"))
}
const App = observer(({ store }) => {
    return (
        <Counter data={store.tripStore.tripList} />
    )
});