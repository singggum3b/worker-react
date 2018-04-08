import {fromPromise, Stream} from "most";

export interface IFetchStreamInput { 0: string | Request , 1?: RequestInit }

export interface IAPIStreamFactoryResult {
    pendingStream: Stream<IFetchStreamInput[]>,
    requestStream: Stream<Response>
}

export interface IStreamFactoryOption {
    skipRepeat?: boolean,
    skipPending?: boolean
}

type IFetchStreamOutput = Promise<[IFetchStreamInput, Response]>;

interface IPendingRequestSeed {
    url: IFetchStreamInput,
    request: IFetchStreamOutput,
    isCached: boolean,
}

function arrayRemoveIf(array: any[], callback: (a: any, i: number) => boolean): void {
    let i = array.length;
    while (i--) {
        if (callback(array[i], i)) {
            array.splice(i, 1);
        }
    }
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

function fetchCall(url: IFetchStreamInput): IFetchStreamOutput {
    return fetch(url[0], url[1]).then((res) => {
        return [url, res] as [IFetchStreamInput, Response];
    });
}

export function apiCallStreamFactory(
    src: Stream<IFetchStreamInput>, option: IStreamFactoryOption = { skipRepeat: true, skipPending: true },
): IAPIStreamFactoryResult {

    const pendingSeed: IPendingRequestSeed[]  = [];
    const urlStream = (option.skipRepeat ? src.skipRepeatsWith(compareFetchInput) : src).multicast();
    const reqStream: Stream<IPendingRequestSeed> = urlStream.map((url) => {
        const cached = pendingSeed.find(s => compareFetchInput(s.url, url));
        if (cached && option.skipPending) {
            return {
                ...cached,
                isCached: true,
            };
        }

        return {
            request: fetchCall(url),
            url,
            isCached: false,
        }
    }).multicast();

    const nonCachedReqStream = reqStream.filter(r => !r.isCached);

    const pendingStream: Stream<IFetchStreamInput[]> = nonCachedReqStream.tap((s) => {
        pendingSeed.push(s);
    }).constant(pendingSeed).merge(
        nonCachedReqStream.map(r => r.request).chain(fromPromise).tap((s) => {
            arrayRemoveIf(pendingSeed, (i) => {
                return i.url === s[0];
            });
        }).constant(pendingSeed),
    ).map(_ => pendingSeed.map(i => i.url)).multicast();

    return {
        requestStream: reqStream.map(r => r.request).awaitPromises().map(r => r[1]).multicast(),
        pendingStream,
    };
}
