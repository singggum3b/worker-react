import {Service} from "typedi";
import {createBrowserHistory, Location} from "history";
import {action, computed, observable, reaction} from "mobx";

@Service()
export class RoutingServices {
    public history = createBrowserHistory();
    @observable private $location: Location | null = null;

    constructor() {
        reaction(() => this.trackURL, (url) => {
           console.info("URL changed: ", url);
        });
    }

    @action
    public setLocation(location: Location): void {
        if (!this.$location) {
            this.$location = location;
        } else {
            Object.assign(this.$location, location);
        }
    }

    @computed public get location(): RoutingServices["$location"] {
        return this.$location;
    }

    @computed public get trackURL(): string {
        if (!this.location) { return ""; }
        return `${this.location.pathname}${this.location.search}`
    }
}
