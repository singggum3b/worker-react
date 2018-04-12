import {Author, IAuthorJSON} from "./author.class";
import {copyFields} from "../utils/tools";

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

export interface IArticleAPIMetaData {
    articlesCount?: number,
}

export interface IArticleJSON extends OnlyJSON<Article> {
    createdAt: string;
    updatedAt: string;
    author: IAuthorJSON;
}

export class Article {

    public static globalInstanceMap = new Map<Article["id"], Article>();

    public static fromJSON(json: IArticleJSON): Article {
        const exist = this.globalInstanceMap.get(json.slug);
        if (exist) {
            return exist.fromJSON(json);
        } else {
            const newInstance = new Article().fromJSON(json);
            Article.globalInstanceMap.set(newInstance.id, newInstance);
            return newInstance;
        }
    }

    public get id(): string {
        return this.slug;
    }

    public slug: string = "";
    public title: string = "";
    public description: string = "";
    public body: string = "";
    public tagList: string[] = [];
    public createdAt: Date = new Date();
    public updatedAt?: Date;
    public favorited: boolean = false;
    public favoritesCount: number = 0;
    public author: Author = new Author();

    public fromJSON(s: IArticleJSON): this {
        const { createdAt, updatedAt, author, ...rest } = s;
        copyFields<Article>(this, rest);
        this.createdAt = new Date(createdAt);
        this.updatedAt = new Date(updatedAt);
        this.author.fromJSON(s.author);
        return this;
    }
}
