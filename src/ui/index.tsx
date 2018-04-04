import * as React from "react";
import * as ReactDOM from "react-dom";
import { observer } from "mobx-react";

import { Router, Route } from "react-router-dom";
import { createBrowserHistory } from "history";

import { IndexStore } from "../store-ui";

import { MobxRouterIntegration } from "./mobx-router";
import TagList from "./components/tag-list";
import {TagStore} from "../store-domain/tag.store";

const history = createBrowserHistory();
export const store = new IndexStore(history);

TagStore.loadTagFromAPI();
TagStore.loadTagFromAPI();
TagStore.loadTagFromAPI();

function wrapper(props: any): React.ReactNode {
    return [
        <React.StrictMode  key="app">
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
                        <div className="article-preview">
                            <div className="article-meta">
                                <a href="profile.html"><img src="http://i.imgur.com/Qr71crq.jpg"/></a>
                                <div className="info">
                                    <a href="" className="author">Eric Simons</a>
                                    <span className="date">January 20th</span>
                                </div>
                                <button className="btn btn-outline-primary btn-sm pull-xs-right">
                                    <i className="ion-heart"></i> 29
                                </button>
                            </div>
                            <a href="" className="preview-link">
                                <h1>How to build webapps that scale</h1>
                                <p>This is the description for the post.</p>
                                <span>Read more...</span>
                            </a>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <TagList />
                    </div>
                </div>
            </div>
        </section>
    );
});
