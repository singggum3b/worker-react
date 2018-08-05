import * as React from "react";
import * as ReactDOM from "react-dom";

import {Router, Route, Link} from "react-router-dom";

import {RouteComponentProps, Switch} from "react-router";
import {SigninPage} from "./page/signin.page";
import {RoutingServices} from "../services/routing.services";
import {Container} from "typedi";
import {HomePage} from "./page/home.page";

const routingServices = Container.get(RoutingServices);

function wrapper(props: RouteComponentProps<any>): React.ReactNode {
    routingServices.setLocation(props.location);
    return [
        <React.StrictMode key="app">
            <App />
        </React.StrictMode>,
    ];
}

export function UI(): void {
    ReactDOM.render((
        <Router history={routingServices.history}>
            <Route
                path="*"
                render={wrapper}
            />
        </Router>
    ), document.getElementById("app"));
}

function App(): any {
    return [
        <nav className="navbar navbar-light" key="nav">
            <div className="container">
                <a className="navbar-brand" href="index.html">conduit</a>
                <ul className="nav navbar-nav pull-xs-right">
                    <li className="nav-item">
                        <Link className="nav-link active" to={"/"}>Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to={"/login"}>
                            <i className="ion-compose"></i>&nbsp;Sign in
                        </Link>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="">
                            <i className="ion-compose"></i>&nbsp;New Post
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="">
                            <i className="ion-gear-a"></i>&nbsp;Settings
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="">Sign up</a>
                    </li>
                </ul>
            </div>
        </nav>,
        <Switch key="body">
            <Route key="home-page" exact path="/">
                <HomePage />
            </Route>
            <Route key="signin" path="/login">
                <SigninPage />
            </Route>,
        </Switch>,
    ];
}
