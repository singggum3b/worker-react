import { observable, action } from "mobx";
import GifyStore from "./gify.store";

export default class Gify {
    id: number;
    store: GifyStore;
    @observable type = "gif";
    @observable url = "";
    @observable preview = "";
    @observable title = "";
    
    @observable user = {
        username: "",
        avatar_url: "",
        profile_url: "",
    };

    constructor(id: number, store: GifyStore) {
        this.id = id;
        this.store = store;
    }

    @action
    fromJSON(json) {
        this.type = json.type;
        this.url = json.images.original.url;
        this.preview = json.images.preview_gif.url;
        this.title = json.title;
        Object.assign(this.user, json.user);
    }

    @action.bound
    showFullScreen() {
        this.store.showFullScreen(this);
    }
}