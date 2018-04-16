import {copyFields} from "../utils/tools";

export interface IUserLogin {
    user: {
        email: string,
        password: string,
    }
}

export interface IUserJSON extends OnlyJSON<User> {}

export class UserStore {

    public user?: User;

    public login(i: IUserLogin): void {

    }
}

export class User {
    public email: string = "";
    public token: string = "";
    public username: string = "";
    public bio: string = "";
    public image?: string;

    private constructor() {}

    public fromJSON(u: IUserJSON): User {
        return copyFields<User>(this, u);
    }
}