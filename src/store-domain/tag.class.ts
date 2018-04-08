import {TagStore} from "./tag.store";

export class Tag {

    public name: string;
    public store: TagStore;

    constructor(name: string, store: TagStore) {
        this.name = name;
        this.store = store;
    }

}