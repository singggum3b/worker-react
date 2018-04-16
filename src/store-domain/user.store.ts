import {copyFields} from "../utils/tools";
import {IndexStore} from "../store-ui";

export interface IUserLogin {
    user: {
        email: string,
        password: string,
    }
}

export interface IUserJSON {
    user: OnlyJSON<User>,
}

export class UserStore {

    public store: IndexStore;
    public user?: User;

    constructor(s: IndexStore) {
        this.store = s;
    }

    public async login(i: IUserLogin): Promise<User> {
        const userJSON: IUserJSON = await fetch("/api/users/login", {
            method: "POST",
            body: JSON.stringify(i),
            headers: {
                "content-type": "application/json",
            },
        }).then(res => res.json());
        return new User().fromJSON(userJSON);
    }
}

export class User {
    public email: string = "";
    public token: string = "";
    public username: string = "";
    public bio: string = "";
    public image?: string;

    public fromJSON(u: IUserJSON): User {
        return copyFields<User>(this, u.user);
    }
}