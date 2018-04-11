import { observable, action } from "mobx";
import {UIArticleList, UITag, UITagList} from "./ui-model";
import { History } from "history";
import {TagStore} from "../store-domain/tag.store";
import {ArticleStore} from "../store-domain/article.store";

export class BaseStore {
    public indexStore: IndexStore;

    constructor(indexStore: IndexStore) {
        this.indexStore = indexStore;
    }
}

export class IndexStore {
    public uiStore: UIStore;
    public tagStore: TagStore;
    public articleStore: ArticleStore;

    public routerStore: RouterStore;
    public history: History;

    constructor(history: History) {
        this.history = history;
        this.tagStore = new TagStore(this);
        this.articleStore = new ArticleStore(this);
        this.routerStore = new RouterStore(this);
        this.uiStore = new UIStore(this);
    }

}

export class UIStore extends BaseStore {

    @observable public tagList = new UITagList(this.indexStore);
    @observable public articleList = new UIArticleList(this.indexStore);
    @observable public articleList2 = new UIArticleList(this.indexStore);

    constructor(indexStore: IndexStore) {
        super(indexStore);
    }

    public openTag(t: UITag): void {
        this.articleList.setTag(t.getRoot());
    }

}

export class RouterStore extends BaseStore {

    public history: History;
    @observable.ref public location: Location | null = null;

    constructor(indexStore: IndexStore) {
        super(indexStore);
        this.history = indexStore.history;
    }

    @action
    public updateLocation(location: Location): void {
        if (!this.location) {
            this.location = location;
        } else {
            Object.assign(this.location, location);
        }
    }
}
