import {Tag} from "./tag.class";
import {create, ISelfEmitStream} from "../utils/most";
import {Stream} from "most";
import {observable} from "mobx";
import {IndexStore} from "../store-ui";

interface IAPIStreamFactoryResult {
    pendingStream: Stream<string[]>,
    requestStream: Stream<Response>
}

interface IStreamFactoryOption {
    skipRepeat: boolean
}

interface IPendingRequestSeed {
    url: string,
    request: Promise<Response>
}

function apiCallStreamFactory(
    src: Stream<string>, option: IStreamFactoryOption = { skipRepeat: true },
): IAPIStreamFactoryResult {

    const urlStream = option.skipRepeat ? src.skipRepeats() : src;
    const reqStream: Stream<Response> = urlStream.loop((pending: IPendingRequestSeed[], url: string) => {
        const pendingRequest = pending.find(s => s.url === url);

        if (pendingRequest && option.skipRepeat) {
            return {
                seed: pending,
                value: pendingRequest.request,
            }
        }
        const newRequest = fetch(url);
        newRequest.then((_) => {
            pending = pending.filter(p => p.request !== newRequest);
        }, reason => {
            console.error(reason);
            pending = pending.filter(p => p.request !== newRequest);
        });

        pending.push({
            url,
            request: newRequest,
        });

        return {
            seed: pending,
            value: newRequest,
        }
    }, []).awaitPromises();

    return {
        requestStream: reqStream,
        pendingStream: urlStream.merge(reqStream.map(r => r.url.replace(window.location.origin, "")))
            .scan((pending: string[], url: string) => {
                console.log(pending, url);
                const hasPending = pending.find(p => p === url);
                if (hasPending) {
                    return pending.filter(p => p !== url);
                }
                pending.push(url);
                return pending;
        }, []),
    }
}

export class TagStore {

    @observable public static tagList: Tag[];
    public static streamAskTagList: ISelfEmitStream<string> = create("streamAskTagList");
    public static streamAPITagList: Stream<Tag[]>;
    public static streamPendingAPICall: Stream<string[]>;

    public static loadTagFromAPI(): void {
        TagStore.streamAskTagList.emit("/api/tags");
    }

    public store: IndexStore;

    constructor(store: IndexStore) {
        this.store = store;
    }

}
const { pendingStream, requestStream } = apiCallStreamFactory(TagStore.streamAskTagList, { skipRepeat: false });

TagStore.streamPendingAPICall = pendingStream;
TagStore.streamAPITagList = requestStream.map(r => r.json()).awaitPromises();
TagStore.streamPendingAPICall.observe((p) => console.log(p));
