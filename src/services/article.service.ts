import {Inject, Service} from "typedi";
import {InstanceService, InstanceClassType} from "./instance.service";
import {CacheInvalidator, IResourceOutput, resourceFactory} from "../utils/most-resource";
import {Article, IArticleAPIJSONMultiple, IArticleAPIOption, IArticleJSON} from "../store-domain/article.class";
import {IFetchStreamInput} from "../utils/most-fetch";
import {Stream} from "most";
import {ISelfEmitStream} from "../utils/most";
import {action} from "mobx";

type LoadArticleSignature = (opts: IArticleAPIOption, c: CacheInvalidator<Article, IArticleAPIOption>) => any;

export interface IArticleStoreSubscribtion {
    loadArticle: LoadArticleSignature,
    unsubscribe: () => void,
    articleStream: Stream<IResourceOutput<Article, IArticleAPIOption>>,
}

@Service()
export class ArticleService {

    @Inject()
    private instanceService!: InstanceService;

    private streamArticleInstance: Stream<Promise<IResourceOutput<Article, IArticleAPIOption>>>;
    private streamArticleQuery: ISelfEmitStream<[IArticleAPIOption, CacheInvalidator<Article, IArticleAPIOption>]>;

    constructor() {
        const {
            resourceStream,
            queryStream,
        } = resourceFactory<Article, IArticleAPIOption>({
            name: "Article",
            model: Article,
            fromJSON: (json: IArticleJSON): Article => {
                return this.instanceService.getUniqueInstance(Article, json.slug).fromJSON(json);
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
            articleStream: this.streamArticleInstance
                .awaitPromises()
                .filter((x) => {
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

    public getUIModel<T>(Model: InstanceClassType<T>, id: string): T {
        const model = this.instanceService.getUniqueInstance(Model, id);
        return model;
    }

    @action.bound
    private loadArticle(opts: IArticleAPIOption, c: CacheInvalidator<Article, IArticleAPIOption>): void {
        this.streamArticleQuery.emit([opts, c]);
    }

}