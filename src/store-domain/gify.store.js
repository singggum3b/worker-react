import { observable, computed, action } from "mobx";
import { asyncAction } from "mobx-utils";
import Gify from "./gify.class";

import type IndexStore from "../store-ui/index";

export default class GifyStore {
    indexStore: IndexStore;
    dispatch;
    @observable gifyList = [];
    @observable isLoading = false;

    constructor(indexStore, dispatch) {
        this.indexStore = indexStore;
        this.dispatch = dispatch;
    }

    @computed get offsetCount() {
        return this.gifyList.length;
    }

    loadTrendingGify = asyncAction("loadTrendingGify",function* () {
        try {
            if (this.isLoading) return;
            this.isLoading = true;
            const res = yield fetch(`
            http://api.giphy.com/v1/gifs/trending?api_key=${GIFY_API_KEY}&limit=${20}&offset=${this.offsetCount}
            `, {});
            const json = yield res.json();
            this.gifyList.push.apply(this.gifyList, json.data.map((item) => {
                const newGify = new Gify(item.id, this);
                newGify.fromJSON(item);
                return newGify;
            }));
        } catch (e) {
            console.error(e);
        } finally {
            this.isLoading = false;
        }
    }).bind(this);

    @action
    showFullScreen(gify: Gify) {
        this.indexStore.uiStore.fullViewUI.gify = gify;
    }
}