import {Tag} from "./tag.class";
import {create, ISelfEmitStream} from "../utils/most";
import {fromPromise, Stream} from "most";
import {action, computed, IObservableArray, observable} from "mobx";
import {IndexStore} from "../store-ui";
import {apiCallStreamFactory, IFetchStreamInput} from "../utils/most-fetch";

export interface ITagsResponse {
    tags: string[],
}

export class TagStore {

    public static streamAskTagList: ISelfEmitStream<IFetchStreamInput> = create("streamAskTagList");
    public static streamAPITagList: Stream<Response>;
    public static streamPendingAPICall: Stream<IFetchStreamInput[]>;
    public static readonly tagList: IObservableArray<Tag> = observable.array([]);
    public static readonly pendingRequest: IObservableArray<IFetchStreamInput> = observable.array([], { deep: false });
    public static store: IndexStore;

    public static loadTagFromAPI(): IFetchStreamInput {
        const newInput: IFetchStreamInput = ["/api/tags"];
        TagStore.streamAskTagList.emit(newInput);
        return newInput;
    }

    constructor(store: IndexStore) {
        TagStore.store = store;
    }

    @computed get tagList(): Tag[] {
        return TagStore.tagList;
    }

}

const { pendingStream, requestStream } = apiCallStreamFactory(
    TagStore.streamAskTagList,
    { skipRepeat: false, skipPending: false },
);

TagStore.streamPendingAPICall = pendingStream;
TagStore.streamAPITagList = requestStream.map(r => r[0]);
TagStore.streamPendingAPICall.observe(action("updatePendingList", (x: IFetchStreamInput[]) => {
    TagStore.pendingRequest.replace(x);
}));
TagStore.streamAPITagList.map(r => r.json()).chain(fromPromise).observe(
    action("updateTagList", (json: ITagsResponse) => {
        TagStore.tagList.replace(json.tags.map((n) => new Tag(n, TagStore.store.tagStore)));
    }),
);
