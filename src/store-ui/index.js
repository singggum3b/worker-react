import { observable, action, extendObservable } from "mobx";
import GifyStore from '../store-domain/gify.store'
import Gify from "../store-domain/gify.class";

export class BaseStore {
    indexStore: IndexStore;
    dispatch;

    constructor(indexStore: IndexStore, dispatch: Function) {
        this.indexStore = indexStore;
        this.dispatch = dispatch;
    }
}

export default class IndexStore {
    uiStore: UIStore;
    dispatch: Function;
    history: Object;

    constructor(createSaga, history) {
        const { dispatch } = createSaga(this);
        this.dispatch = dispatch;
        this.history = history;
        this.uiStore = new UIStore(this, dispatch);
        this.gifyStore = new GifyStore(this, dispatch);
    }

}

export class UIStore extends BaseStore {

    @observable fullViewUI = new FullViewUI();

    constructor(indexStore: IndexStore, dispatch: Function) {
        super(indexStore, dispatch);
    }

}

class FullViewUI {
    @observable gify: Gify = null;

    @action.bound
    close(e) {
        if (e.target !== e.currentTarget) return;
        this.gify = null;
    }

}
