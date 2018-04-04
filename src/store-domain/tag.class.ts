export class Tag {

    public static fromAPI(tags: string[]): Tag[] {
        return tags.map(name => new Tag(name))
    }

    public name: string;

    constructor(name: string) {
        this.name = name
    }

}