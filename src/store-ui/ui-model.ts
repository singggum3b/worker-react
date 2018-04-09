import {IndexStore} from "./index";
import {action, computed, observable, reaction} from "mobx";
import {TagStore} from "../store-domain/tag.store";
import {Tag} from "../store-domain/tag.class";
import {IFetchStreamInput} from "../utils/most-fetch";
import {Article} from "../store-domain/article.class";
import {IArticleAPIOption} from "../store-domain/article.store";
import {create, ISelfEmitStream} from "../utils/most";
import {copyFields} from "../utils/tools";
import {SyntheticEvent} from "react";

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

    public streamLoadArticle: ISelfEmitStream<IArticleAPIOption> = create("streamLoadArticle");

    public uiPagination: UIArticleListPagination;

    constructor(indexStore: IndexStore) {
        this.indexStore = indexStore;

        reaction(() => {
            const o: IArticleAPIOption = {
                tag: (this.tag || { name: undefined}).name,
                offset: (this.pageNumber - 1) * this.articlePerPage,
                limit: this.articlePerPage,
            };
            return o;
        }, (opts) => {
            this.streamLoadArticle.emit(opts);
        });

        this.streamLoadArticle.scan((prevOption: IArticleAPIOption, nextOption): IArticleAPIOption => {
            return copyFields(prevOption, nextOption);
        }, {
            offset: 0,
            limit: this.articlePerPage,
        }).observe(action("UIArticleList.loadArticle", (opts) => {
            this.requestHash = this.indexStore.articleStore.loadArticle(opts);
        }));

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
    public refresh(): void {
        this.streamLoadArticle.emit({});
    }

    @action.bound
    public setTag(t: Tag): void {
        this.tag = t;
        this.pageNumber = 1;
    }

    @action.bound
    public setPage(n: number): void {
        this.pageNumber = n;
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

    public setPage = (e: SyntheticEvent<{value: number}>): void => {
        this.parent.setPage(e.currentTarget.value);
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
