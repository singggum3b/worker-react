import {IndexStore} from "./index";
import {observable} from "mobx";
import {IUserLogin} from "../store-domain/user.store";

export class UILoginForm {

    @observable private email: string = "";
    @observable private password: string = "";

    protected store: IndexStore;

    constructor(s: IndexStore) {
        this.store = s;
    }

    private toJSON = (): IUserLogin => {
        const { email, password } = this;
        return {
            user: {
                email, password,
            },
        }
    }
}