import {Tag} from "./tag.class";
import {create, ISelfEmitStream} from "../utils/most";
import {Stream} from "most";
import {observable} from "mobx";
import {IndexStore} from "../store-ui";

interface IAPIStreamFactoryResult {
    pendingStream: Stream<IFetchStreamInput[]>,
    requestStream: Stream<Response>
}

interface IStreamFactoryOption {
    skipRepeat?: boolean,
    skipPending?: boolean
}

interface IFetchStreamInput { 0: string | Request , 1?: RequestInit }
interface IFetchStreamOutput { 0: IFetchStreamInput, 1: Promise<[IFetchStreamInput, Response]> }
interface IFetchStreamPendingUpdate { 0?: IFetchStreamInput, 1?: IFetchStreamInput }

interface IPendingRequestSeed {
    url: IFetchStreamInput,
    request: Promise<[IFetchStreamInput, Response]>
}

function compareFetchInput(a: IFetchStreamInput, b: IFetchStreamInput): boolean {
    // TODO: May be use deep compare instead
    if (a[0] !== b[0]) {
        return false;
    }
    if (a[1] && b[1]) {
        return a[1] === b[1];
    }
    return true;
}

function apiCallStreamFactory(
    src: Stream<IFetchStreamInput>, option: IStreamFactoryOption = { skipRepeat: true, skipPending: true },
): IAPIStreamFactoryResult {

    const urlStream = option.skipRepeat ? src.skipRepeatsWith(compareFetchInput) : src;
    const reqStream: Stream<IFetchStreamOutput> = urlStream.loop((pending: IPendingRequestSeed[], url: IFetchStreamInput) => {
        const pendingRequest = pending.find(s => compareFetchInput(s.url, url));

        if (pendingRequest && option.skipPending) {
            return {
                seed: pending,
                value: [url, pendingRequest.request] as IFetchStreamOutput,
            }
        }
        const newRequest = fetch(url[0], url[1]).then(
            (r: Response) => {
                pending = pending.filter(p => p.request !== newRequest);
                return ([url, r] as [IFetchStreamInput, Response]);
            });

        pending.push({
            url,
            request: newRequest,
        });

        return {
            seed: pending,
            value: [url, newRequest] as IFetchStreamOutput,
        }
    }, []).multicast();

    const reqSentStream = reqStream.map((r) => r[0]);
    const reqPromiseStream = reqStream.map((r) => r[1]);

    return {
        requestStream: reqPromiseStream.awaitPromises().map(r => r[1]),
        pendingStream: reqSentStream.map(r => [r, undefined] as IFetchStreamPendingUpdate)
            .merge(reqPromiseStream.awaitPromises().map(r => [undefined, r[0]] as IFetchStreamPendingUpdate))
            .scan((pending: IFetchStreamInput[], evt: IFetchStreamPendingUpdate) => {
                if (evt[0]) {
                    return pending.concat([evt[0]!])
                }
                if (evt[1]) {
                    return pending.filter((r) => r !== evt[1])
                }
                return pending;
            }, []),
    };
}

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
