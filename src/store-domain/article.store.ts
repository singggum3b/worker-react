import {IndexStore} from "../store-ui";
import {apiCallStreamFactory, IFetchStreamInput, requestHash} from "../utils/most-fetch";
import {create, ISelfEmitStream} from "../utils/most";
import {fromPromise, Stream} from "most";
import {action, IObservableArray, observable, ObservableMap} from "mobx";
import {Article, IArticleJSON} from "./article.class";
import {CacheInvalidator, resourceFactory} from "../utils/most-resource";

export type IArticleAPIOption = { // tslint:disable-line
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

interface IArticleAPIMetaData {
    articlesCount?: number,
}

function requestHasher(i: IFetchStreamInput): string {
    return JSON.stringify(i[0]) + (i[1] ? JSON.stringify(i[1]) : "");
}

export class ArticleStore {

    public streamArticleList: Stream<[Response, requestHash]>;
    public streamPendingXHR: Stream<IFetchStreamInput[]>;
    public streamCallArticle: ISelfEmitStream<IFetchStreamInput> = create("streamCallArticle");
    public streamArticleInstance: Stream<Promise<Article[]>>;
    public streamArticleQuery: ISelfEmitStream<[IArticleAPIOption, CacheInvalidator<Article, IArticleAPIOption>]>;
    @observable public readonly articlesList: IObservableArray<Article> = observable([]);

    public store: IndexStore;
    public metaData: ObservableMap<requestHash, IArticleAPIMetaData>
        = observable.map(undefined, { deep: false });

    constructor(store: IndexStore) {
        this.store = store;
        const { requestStream, pendingStream } = apiCallStreamFactory(this.streamCallArticle, {
            useCache: true,
            requestHasher,
        });
        this.streamPendingXHR = pendingStream;
        this.streamArticleList = requestStream;

        this.streamArticleList.map(r => r[0].json().then(x => [x, r[1]] as [IArticleAPIJSONMultiple, requestHash]))
            .chain(fromPromise)
            .observe(action("syncArticle", (res: [IArticleAPIJSONMultiple, requestHash]) => {
                const { articles, articlesCount } = res[0];
                articles.forEach((a) => {
                    const cached = this.articlesList.find(ca => ca.slug === a.slug);
                    if (cached) {
                        cached.fromJSON(a);
                    } else {
                        this.articlesList.push(new Article().fromJSON(a).addResourceHash(res[1]));
                    }
                });
                // Update request metadata
                this.metaData.set(res[1], {
                    articlesCount,
                });
            }));

        const {
            resourceStream,
            queryStream,
        } = resourceFactory<Article, IArticleAPIOption>({
            name: "Article",
            model: Article,
            processJSON: this.processJSON,
        });
        this.streamArticleInstance = resourceStream;
        this.streamArticleQuery = queryStream;
    }

    public processJSON(json: IArticleAPIJSONMultiple): IArticleJSON[] {
        return json.articles;
    }

    @action.bound
    public loadArticle(opts: IArticleAPIOption, c: CacheInvalidator<Article, IArticleAPIOption>): void {
        // const url = new URL(window.location.origin);
        // url.pathname = "/api/articles";
        // if (opts) {
        //     Object.keys(opts).forEach(key => {
        //         const optValue = (opts as any)[key];
        //         (optValue !== undefined) && url.searchParams.append(key, optValue)
        //     });
        // }
        // const newInput = [url.toString()] as IFetchStreamInput;
        // this.streamCallArticle.emit(newInput);
        // return requestHasher(newInput);
        this.streamArticleQuery.emit([opts, c])
    }
}
