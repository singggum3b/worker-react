import {IndexStore} from "./index";
import {action, observable} from "mobx";
import {IUserLogin} from "../store-domain/user.store";
import {SyntheticEvent} from "react";

export class UILoginForm {

    public store: IndexStore;

    @observable public email: string = "";
    @observable public password: string = "";

    constructor(s: IndexStore) {
        this.store = s;
    }

    @action.bound
    public setPassword(e: SyntheticEvent<HTMLInputElement>): void {
        this.password = e.currentTarget.value;
    }

    @action.bound
    public setEmail(e: SyntheticEvent<HTMLInputElement>): void {
        this.email = e.currentTarget.value;
    }

    public login = (): void => {
        this.store.userStore.login(this.toJSON());
    };

    private toJSON = (): IUserLogin => {
        const { email, password } = this;
        return {
            user: {
                email, password,
            },
        }
    }
}