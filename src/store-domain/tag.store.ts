import {Tag} from "./tag.class";
import {create, ISelfEmitStream} from "../utils/most";
import {fromPromise, just, Stream} from "most";
import {observable} from "mobx";

interface IAPIStreamFactoryResult {
    pendingStream: Stream<string>,
    requestStream: Stream<Response>
}

interface IStreamFactoryOption {
    skipRepeat?: boolean
}

function apiCallStreamFactory(src: Stream<string>, option: IStreamFactoryOption = {}): IAPIStreamFactoryResult {
    const urlStream = option.skipRepeat ? src.skipRepeats() : src;
    const requestStream = urlStream.loop((pending: { url: string, s: Stream<Response> }[], url: string) => {
        const pendingRequest = pending.find(s => s.url === url);
        if (pendingRequest) {
            return {
                seed: pendingRequest,
                value: pendingRequest.s,
            }
        }
        const newRequestStream = fromPromise(fetch(url));
        newRequestStream.observe(() => {
            pending = pending.filter(s => s.s === newRequestStream);
        }).catch((e) => {
            console.error(e);
            pending = pending.filter(s => s.s === newRequestStream);
        });

        return {
            seed: pending.push({
                url,
                s: newRequestStream,
            }),
            value: fromPromise(fetch(url)),
        }
    }, []);

    return {
        requestStream,
        pendingStream,
    }
}

export class TagStore {

    @observable public static tagList: Tag[];
    public static loadTagListRequest: ISelfEmitStream<string> = create("loadTagListRequest");
    public static streamAPITagList: Stream<Tag[]> = TagStore.createStreamAPITagList();
    public static pendingAPICall: Stream<string>;

    private static createStreamAPITagList(): Stream<Tag[]> {
        return TagStore.loadTagListRequest
            .skipRepeats()
            .scan((pending: [], url: string) => {

            }, [])

    }

    constructor() {}

    public loadTagFromAPI(): void {
        TagStore.loadTagListRequest.emit("/api/tags");
    }

}