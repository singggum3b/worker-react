import {IndexStore} from "./index";
import {action, computed, observable, reaction} from "mobx";
import {TagStore} from "../store-domain/tag.store";
import {Tag} from "../store-domain/tag.class";
import {IFetchStreamInput} from "../utils/most-fetch";
import {Article} from "../store-domain/article.class";
import {IArticleAPIOption} from "../store-domain/article.store";

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
    public readonly articlePerPage = 10;
    @observable.ref public tag?: Tag;
    @observable public pageNumber = 1;
    @observable public requestHash?: string;
    public uiPagination: UIArticleListPagination;

    constructor(indexStore: IndexStore) {
        this.indexStore = indexStore;
        reaction(() => [this.tag, this.pageNumber], (_) => {
            console.log(_);
            if (this.articleList.length === 0 || (this.articleList.length < this.articlePerPage)) {
                this.loadArticleList();
            }
        });
        this.uiPagination = new UIArticleListPagination(this);
    }

    @computed get pageCount(): number {
        if (!this.requestHash) { return -1; }
        const articleCache = this.indexStore.articleStore.metaData.get(this.requestHash);
        const articleCount = articleCache ? articleCache.articlesCount : 0;
        if (!articleCount) { return -1 }
        return Math.round(articleCount / this.articlePerPage);
    }

    @computed get articleList(): Article[] {
        if (this.tag && this.requestHash) {
            return this.articleListByHash;
        }
        return this.indexStore.articleStore.articlesList
            .filter(a => a.resourceHash[this.requestHash || ""]);
    }

    @computed get articleListByTag(): Article[] {
        return this.indexStore.articleStore.articlesList
            .filter(t => t.tagList.includes((this.tag || { name: ""}).name));
    }

    @computed get articleListByHash(): Article[] {
        return this.indexStore.articleStore.articlesList
            .filter(t => t.resourceHash[this.requestHash || ""]);
    }

    @action.bound
    public loadArticleList(opt?: IArticleAPIOption): void {
        this.requestHash = this.indexStore.articleStore.loadArticle({
            tag: (this.tag || { name: undefined }).name,
            limit: this.articlePerPage,
            offset: (this.pageNumber - 1) * this.articlePerPage,
            ...opt,
        });
        console.log(this.requestHash);
    }

    @action.bound
    public setTag(t: Tag): void {
        this.tag = t;
        this.setPage(1);
        this.loadArticleList();
    }

    @action.bound
    public setPage(n: number): void {
        this.pageNumber = n;
        this.loadArticleList();
    }
}

export class UIArticleListPagination {
    public parent: UIArticleList;

    constructor(s: UIArticleList) {
        this.parent = s;
    }

    @computed get pageCount(): number {
        return this.parent.pageCount;
    }

    public setPage = (n: number): void => {
        this.parent.setPage(n);
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
    };

    public getRoot(): Tag {
        return this.tag;
    }

}
