import {IndexStore} from "./index";
import {action, computed, IObservableArray, observable, reaction} from "mobx";
import {TagStore} from "../store-domain/tag.store";
import {Tag} from "../store-domain/tag.class";
import {IFetchStreamInput} from "../utils/most-fetch";
import {Article, IArticleAPIMetaData, IArticleAPIOption} from "../store-domain/article.class";
import {create, ISelfEmitStream} from "../utils/most";
import {SyntheticEvent} from "react";
import {Container} from "typedi";
import {ArticleService, IArticleStoreSubscribtion} from "../services/article.service";

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

    public readonly articlePerPage = 10;
    @observable.ref public tag?: Tag;
    @observable public pageNumber = 1;
    @observable public requestHash?: string;
    @observable public articleList: IObservableArray<Article> = observable.array([]);
    @observable public totalArticle: number = 0;

    public streamLoadArticle: ISelfEmitStream<IArticleAPIOption> = create("streamLoadArticle");

    public uiPagination: UIArticleListPagination = new UIArticleListPagination(this);

    private articleService = Container.get(ArticleService);

    private articleStoreSubscribtion: IArticleStoreSubscribtion;

    constructor() {

        this.articleStoreSubscribtion = this.articleService.subscribe();
        this.articleStoreSubscribtion.articleStream.observe((r) => {
            const rawJSON: IArticleAPIMetaData = r.rawJSON;
            action(() => {
                this.articleList.replace(r.instanceList);
                this.totalArticle = rawJSON.articlesCount || 0;
            })();
        });

        reaction(() => {
            return {
                tag: (this.tag || {name: undefined}).name,
                offset: (this.pageNumber - 1) * this.articlePerPage,
                limit: this.articlePerPage,
            };
        }, (opts) => {
            this.streamLoadArticle.emit(opts);
        });

        this.streamLoadArticle.observe(action("UIArticleList.loadArticle", (opts) => {
            this.articleStoreSubscribtion.loadArticle(opts, this.articleListInvalidator);
        }));

    }

    @action.bound
    public refresh(): void {
        this.streamLoadArticle.emit({
            offset: 0,
            limit: this.articlePerPage,
        });
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

    @action.bound
    public removeArticle(a: Article): void {
        this.articleList.remove(a);
    };

    private articleListInvalidator = (a: Article[], _: IArticleAPIOption): boolean => {
        return a.length >= this.articlePerPage;
    };

    @computed get pageCount(): number {
        return Math.ceil(this.totalArticle / this.articlePerPage);
    }

}

export class UIArticleItem {

    public static fromArticle(a: Article): UIArticleItem {
        const exist = UIArticleItem.instanceMap.get(a);
        if (exist) {
            return exist;
        }
        const newInstance = new UIArticleItem(a);
        UIArticleItem.instanceMap.set(a, newInstance);
        return newInstance;
    }
    private static instanceMap = new WeakMap<Article, UIArticleItem>();

    public readonly article: Article;

    private constructor(a: Article) {
        this.article = a;
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
