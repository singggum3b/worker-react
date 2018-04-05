import {Tag} from "./tag.class";
import {create, ISelfEmitStream} from "../utils/most";
import {Stream} from "most";
import {observable} from "mobx";
import {IndexStore} from "../store-ui";
import {apiCallStreamFactory, IFetchStreamInput} from "../utils/most-fetch";

export class TagStore {

    @observable public static tagList: Tag[];
    public static streamAskTagList: ISelfEmitStream<IFetchStreamInput> = create("streamAskTagList");
    public static streamAPITagList: Stream<Tag[]>;
    public static streamPendingAPICall: Stream<IFetchStreamInput[]>;

    public static loadTagFromAPI(): void {
        TagStore.streamAskTagList.emit(["/api/tags"]);
    }

    public store: IndexStore;

    constructor(store: IndexStore) {
        this.store = store;
    }

}

const { pendingStream, requestStream } = apiCallStreamFactory(
    TagStore.streamAskTagList,
    { skipRepeat: false, skipPending: false },
);

TagStore.streamPendingAPICall = pendingStream;
TagStore.streamAPITagList = requestStream.map(r => r.json()).awaitPromises();
TagStore.streamPendingAPICall.observe(x => console.log(x));
