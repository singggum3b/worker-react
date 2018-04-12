import {IndexStore} from "../store-ui";
import {IFetchStreamInput, requestHash} from "../utils/most-fetch";
import {ISelfEmitStream} from "../utils/most";
import {Stream} from "most";
import {action, IObservableValue, observable, ObservableMap} from "mobx";
import {Article, IArticleAPIJSONMultiple, IArticleAPIMetaData, IArticleAPIOption, IArticleJSON} from "./article.class";
import {CacheInvalidator, resourceFactory} from "../utils/most-resource";

type LoadArticleSignature = (opts: IArticleAPIOption, c: CacheInvalidator<Article, IArticleAPIOption>) => any;

export interface IArticleStoreSubscribtion {
    loadArticle: LoadArticleSignature,
    unsubscribe: () => void,
    currentArticleListKey: IObservableValue<any>
}

export class ArticleStore {

    public streamArticleInstance: Stream<Promise<[IArticleAPIOption, Article[]]>>;
    public streamArticleQuery: ISelfEmitStream<[IArticleAPIOption, CacheInvalidator<Article, IArticleAPIOption>]>;
    public readonly articlesList = new WeakMap<IArticleAPIOption, Article[]>();

    public store: IndexStore;
    public metaData: ObservableMap<requestHash, IArticleAPIMetaData>
        = observable.map(undefined, { deep: false });

    constructor(store: IndexStore) {
        this.store = store;

        const {
            resourceStream,
            queryStream,
        } = resourceFactory<Article, IArticleAPIOption>({
            name: "Article",
            model: Article,
            processJSON: this.processJSON,
            queryToRequest: (opts: IArticleAPIOption): IFetchStreamInput => {
                const url = new URL(window.location.origin);
                url.pathname = "/api/articles";
                if (opts) {
                    Object.keys(opts).forEach(key => {
                        const optValue = (opts as any)[key];
                        (optValue !== undefined) && url.searchParams.append(key, optValue)
                    });
                }
                return [url.toString()] as IFetchStreamInput;
            },
        });
        this.streamArticleInstance = resourceStream;
        this.streamArticleQuery = queryStream;
    }

    public processJSON(json: IArticleAPIJSONMultiple): IArticleJSON[] {
        return json.articles;
    }

    public subscribe(): IArticleStoreSubscribtion {

        const loadArticle = this.loadArticle;
        const currentArticleListKey = observable.box({}, {deep: false});

        return {
            loadArticle: (opts: IArticleAPIOption, c: CacheInvalidator<Article, IArticleAPIOption>): void => {
                const subscribtion = this.streamArticleInstance.awaitPromises()
                    .subscribe({
                        next: action("updateArticleList.Store", (x: [IArticleAPIOption, Article[]]) => {
                            if (x[0] === opts) {
                                this.articlesList.set(x[0], x[1]);
                                currentArticleListKey.set(x[0]);
                                subscribtion.unsubscribe();
                            }
                        }),
                        error(e): void { console.error(e); subscribtion.unsubscribe(); },
                        complete(): void { subscribtion.unsubscribe(); },
                    });
                loadArticle(opts, c);
            },
            currentArticleListKey,
            unsubscribe: (): void => {
                this.articlesList.delete(currentArticleListKey.get());
            },
        }
    }

    @action.bound
    private loadArticle(opts: IArticleAPIOption, c: CacheInvalidator<Article, IArticleAPIOption>): void {
        this.streamArticleQuery.emit([opts, c]);
    }
}
