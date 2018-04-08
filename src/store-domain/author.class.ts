import {copyFields} from "../utils/tools";

export interface IAuthorJSON extends OnlyJSON<Author> {
}

export class Author {
    public username: string = "";
    public bio: string = "";
    public image: string = "";
    public following: boolean = false;

    public fromJSON(s: IAuthorJSON): this {
        copyFields<Author>(this, s);
        return this;
    }
}