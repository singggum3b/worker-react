import {IndexStore} from "./index";
import {action, computed, observable} from "mobx";
import {TagStore} from "../store-domain/tag.store";
import {Tag} from "../store-domain/tag.class";
import {IFetchStreamInput} from "../utils/most-fetch";
import {Article} from "../store-domain/article.class";

export class UITagList {

    public indexStore: IndexStore;
    private pendingInput: IFetchStreamInput | null = null;

    constructor(indexStore: IndexStore) {
        this.indexStore = indexStore;
    }

    @computed get hasData(): boolean {
        return !!this.tagList.length;
    }

    @computed get isLoading(): boolean {
        return TagStore.pendingRequest.some(p => {
            return p === this.pendingInput;
        });
    }

    @computed get tagList(): UITag[] {
        return TagStore.tagList.map(t => UITag.fromTag(t));
    }

    @action.bound
    public loadTagList(): void {
        this.pendingInput = (TagStore.loadTagFromAPI());
    }
}

export class UIArticleList {

    public indexStore: IndexStore;
    @observable public tag?: Tag;

    constructor(indexStore: IndexStore) {
        this.indexStore = indexStore;
    }

    @computed get articleList(): Article[] {
        return this.indexStore.articleStore.articlesList;
    }

    @computed get articleListByTag(): Article[] {
        return this.articleList.filter(t => t.tagList.includes((this.tag || { name: ""}).name))
    }

    public loadArticleList(): void {
        this.indexStore.articleStore.loadArticle();
    }

    public setTag(t: Tag): void {
        this.tag = t;
    }
}

export class UITag {

    public static fromTag(t: Tag): UITag {
        const cached = UITag.instanceMap.get(t);
        if (cached) {
            return cached
        }
        const newInstance = new UITag(t);
        UITag.instanceMap.set(t, newInstance);
        return newInstance;
    }

    private static instanceMap = new WeakMap();

    private tag: Tag;

    private constructor(tag: Tag) {
        this.tag = tag;
    }

    @computed get id(): string {
        return this.tag.name;
    }

    public openTag = (): void => {
        TagStore.store.uiStore.openTag(this);
    }

    public getRoot(): Tag {
        return this.tag;
    }

}