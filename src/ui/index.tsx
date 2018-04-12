import * as React from "react";
import * as ReactDOM from "react-dom";
import { observer } from "mobx-react";

import { Router, Route } from "react-router-dom";
import { createBrowserHistory } from "history";

import { IndexStore } from "../store-ui";

import { MobxRouterIntegration } from "./mobx-router";
import TagList from "./components/tag-list";
import ArticleList from "./components/article-list";

const history = createBrowserHistory();
export const store = new IndexStore(history);

function wrapper(props: any): React.ReactNode {
    return [
        <React.StrictMode key="app">
            <APP />
        </React.StrictMode>,
        <MobxRouterIntegration key="mri" {...props} store={store} />,
    ];
}

export function UI(): void {
    ReactDOM.render((
        <Router history={history}>
            <Route
                path="*"
                render={wrapper}
            />
        </Router>
    ), document.getElementById("app"));
}

const APP = observer(function App(): any {
    return (
        <section className="home-page" >
            <div className="banner">
                <div className="container">
                    <h1 className="logo-font">conduit</h1>
                    <p>A place to share your knowledge.</p>
                </div>
            </div>
            <div className="container page">
                <div className="row">
                    <div className="col-md-9">
                        <div className="feed-toggle">
                            <ul className="nav nav-pills outline-active">
                                <li className="nav-item">
                                    <a className="nav-link disabled" href="">Your Feed</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link active" href="">Global Feed</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <ArticleList model={store.uiStore.articleList} />
                        </div>
                        <div>
                            <ArticleList model={store.uiStore.articleList2} />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <TagList model={store.uiStore.tagList} />
                    </div>
                </div>
            </div>
        </section>
    );
});
