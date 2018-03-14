import React from "react";
import ReactDOM from "react-dom";
import DevTools from "mobx-react-devtools";
import { observer, Observer } from 'mobx-react';

import IndexStore from "../store-ui/index";
import createSaga from "../saga";

import GifyList from "./components/gify-list";
import GifyFullView from "./components/gify-full-view";

export const store: IndexStore = new IndexStore(createSaga);

export default function UI() {
    ReactDOM.render((
        <App />
    ), document.getElementById("app"));
    store.gifyStore.loadTrendingGify();
}

const App = observer(function App() {
    return (
        <section className="gifyApp" >
            <GifyList gifyList={store.gifyStore.gifyList} />
            {
                store.gifyStore.isLoading !== true ?
                    <button className="loadMore" onClick={store.gifyStore.loadTrendingGify}>Load 20 more</button>
                    :
                    <div className="loadMore">...Loading...</div>
            }
            <GifyFullView model={store.uiStore.fullViewUI} />
            <DevTools/>
        </section>
    )
});