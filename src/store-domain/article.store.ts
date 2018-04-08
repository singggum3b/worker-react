import {IndexStore} from "../store-ui";
import {apiCallStreamFactory, IFetchStreamInput} from "../utils/most-fetch";
import {create, ISelfEmitStream} from "../utils/most";
import {fromPromise, Stream} from "most";
import {action, IObservableArray, observable} from "mobx";
import {Article, IArticleJSON} from "./article.class";

export interface IArticleAPIOption {
    [query: string]: string | number | undefined,
    tag?: string,
    author?: string,
    favorited?: string,
    limit?: number,
    offset?: number,
}

export interface IArticleAPIJSONMultiple {
    articles: IArticleJSON[],
    articlesCount: number,
}

export class ArticleStore {

    public streamArticleList: Stream<Response>;
    public streamPendingXHR: Stream<IFetchStreamInput[]>;
    public streamCallArticle: ISelfEmitStream<IFetchStreamInput> = create("streamCallArticle");
    @observable public readonly articlesList: IObservableArray<Article> = observable([]);

    public store: IndexStore;

    constructor(store: IndexStore) {
        this.store = store;
        const { requestStream, pendingStream } = apiCallStreamFactory(this.streamCallArticle);
        this.streamPendingXHR = pendingStream;
        this.streamArticleList = requestStream;

        this.streamArticleList.map(r => r.json())
            .chain(fromPromise)
            .observe(action("syncArticle", (json: IArticleAPIJSONMultiple) => {
                const { articles } = json;
                articles.forEach((a) => {
                    const cached = this.articlesList.find(ca => ca.slug === a.slug);
                    if (cached) {
                        cached.fromJSON(a);
                    } else {
                        this.articlesList.push(new Article().fromJSON(a));
                    }
                });
            }));
    }

    @action.bound
    public loadArticle(opts?: IArticleAPIOption): IFetchStreamInput {
        const url = new URL(window.location.origin);
        url.pathname = "/api/articles";
        if (opts) {
            Object.keys(opts).forEach(key => url.searchParams.append(key, opts[key] ? opts[key]!.toString() : ""));
        }
        const newInput = ["/api/articles"] as IFetchStreamInput;
        this.streamCallArticle.emit(newInput);
        return newInput;
    }
}