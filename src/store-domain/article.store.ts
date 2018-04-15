import {IndexStore} from "../store-ui";
import {IFetchStreamInput, requestHash} from "../utils/most-fetch";
import {ISelfEmitStream} from "../utils/most";
import {fromPromise, Stream} from "most";
import {action, observable, ObservableMap} from "mobx";
import {Article, IArticleAPIJSONMultiple, IArticleAPIMetaData, IArticleAPIOption, IArticleJSON} from "./article.class";
import {CacheInvalidator, resourceFactory} from "../utils/most-resource";

type LoadArticleSignature = (opts: IArticleAPIOption, c: CacheInvalidator<Article, IArticleAPIOption>) => any;

export interface IArticleStoreSubscribtion {
    loadArticle: LoadArticleSignature,
    unsubscribe: () => void,
    articleStream: Stream<[IArticleAPIOption, Article[]]>,
}

export class ArticleStore {

    public readonly articlesList = new WeakMap<IArticleAPIOption, Article[]>();

    public store: IndexStore;
    public metaData: ObservableMap<requestHash, IArticleAPIMetaData>
        = observable.map(undefined, { deep: false });

    private streamArticleInstance: Stream<Promise<[IArticleAPIOption, Article[]]>>;
    private streamArticleQuery: ISelfEmitStream<[IArticleAPIOption, CacheInvalidator<Article, IArticleAPIOption>]>;

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
        this.streamArticleQuery = queryStream;
        this.streamArticleInstance = resourceStream.multicast();
        this.streamArticleInstance.chain(fromPromise).forEach((x) => console.log(x));
    }

    public processJSON(json: IArticleAPIJSONMultiple): IArticleJSON[] {
        return json.articles;
    }

    public subscribe(): IArticleStoreSubscribtion {

        const loadArticle = this.loadArticle;
        let currentOption: IArticleAPIOption | null;

        return {
            articleStream: this.streamArticleInstance.awaitPromises().filter((x) => {
                return x[0] === currentOption;
            }),
            loadArticle: (opts: IArticleAPIOption, c: CacheInvalidator<Article, IArticleAPIOption>): void => {
                currentOption = opts;
                loadArticle(opts, c);
            },
            unsubscribe: (): void => {
                currentOption = null;
            },
        }
    }

    @action.bound
    private loadArticle(opts: IArticleAPIOption, c: CacheInvalidator<Article, IArticleAPIOption>): void {
        this.streamArticleQuery.emit([opts, c]);
    }
}
