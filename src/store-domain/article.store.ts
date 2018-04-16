import {IndexStore} from "../store-ui";
import {IFetchStreamInput} from "../utils/most-fetch";
import {ISelfEmitStream} from "../utils/most";
import {Stream} from "most";
import {action} from "mobx";
import {Article, IArticleAPIJSONMultiple, IArticleAPIOption, IArticleJSON} from "./article.class";
import {CacheInvalidator, IResourceOutput, resourceFactory} from "../utils/most-resource";

type LoadArticleSignature = (opts: IArticleAPIOption, c: CacheInvalidator<Article, IArticleAPIOption>) => any;

export interface IArticleStoreSubscribtion {
    loadArticle: LoadArticleSignature,
    unsubscribe: () => void,
    articleStream: Stream<IResourceOutput<Article, IArticleAPIOption>>,
}

export class ArticleStore {

    public store: IndexStore;

    private streamArticleInstance: Stream<Promise<IResourceOutput<Article, IArticleAPIOption>>>;
    private streamArticleQuery: ISelfEmitStream<[IArticleAPIOption, CacheInvalidator<Article, IArticleAPIOption>]>;

    constructor(store: IndexStore) {
        this.store = store;

        const {
            resourceStream,
            queryStream,
        } = resourceFactory<Article, IArticleAPIOption>({
            name: "Article",
            model: Article,
            fromJSON: (json: IArticleJSON): Article => {
                return Article.fromJSON(json, store.articleStore);
            },
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
    }

    public processJSON(json: IArticleAPIJSONMultiple): IArticleJSON[] {
        return json.articles;
    }

    public subscribe(): IArticleStoreSubscribtion {

        const loadArticle = this.loadArticle;
        let currentOption: IArticleAPIOption | null;

        return {
            articleStream: this.streamArticleInstance.awaitPromises().filter((x) => {
                return x.query === currentOption;
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
