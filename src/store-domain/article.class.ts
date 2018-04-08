import {Author, IAuthorJSON} from "./author.class";
import {copyFields} from "../utils/tools";

export interface IArticleJSON extends OnlyJSON<Article> {
    createdAt: string;
    updatedAt: string;
    author: IAuthorJSON;
}

export class Article {
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
