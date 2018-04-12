import {fromPromise, Stream} from "most";
import {copyFields} from "./tools";

export interface IFetchStreamInput { 0: string | Request , 1?: RequestInit }

export interface IAPIStreamFactoryResult {
    pendingStream: Stream<IFetchStreamInput[]>,
    requestStream: Stream<[Response, requestHash, IFetchStreamInput]>
}

export interface IStreamFactoryOption {
    skipRepeat?: boolean,
    skipPending?: boolean,
    requestHasher?: (i: IFetchStreamInput) => string,
    useCache?: boolean,
}

export type requestHash = string;

type IFetchStreamOutput = Promise<[IFetchStreamInput, Response, requestHash]>;

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

function fetchCall(url: IFetchStreamInput, hash?: requestHash): IFetchStreamOutput {
    return fetch(url[0], url[1]).then((res) => {
        return [url, res, hash] as [IFetchStreamInput, Response, requestHash];
    });
}

function validateOptions(opts?: IStreamFactoryOption): void {
    if (!opts) { return }
    if (opts.useCache && !opts.requestHasher) {
        throw new Error("option.useCache require option.requestHasher provided");
    }
}

export function apiCallStreamFactory(
    src: Stream<IFetchStreamInput>, option?: IStreamFactoryOption,
): IAPIStreamFactoryResult {

    validateOptions(option);
    const defaultOptions = { skipRepeat: true, skipPending: true };
    const opts: IStreamFactoryOption = option ?
        copyFields<IStreamFactoryOption>(defaultOptions, option) : defaultOptions;

    const requestCache: {[key: string]: IFetchStreamOutput} = {};
    const pendingSeed: IPendingRequestSeed[]  = [];

    const urlStream = (opts.skipRepeat ? src.skipRepeatsWith(compareFetchInput) : src).multicast();
    const reqStream: Stream<IPendingRequestSeed> = urlStream.map((url) => {

        const rHash = opts.requestHasher ? opts.requestHasher(url) : undefined;
        const cached = pendingSeed.find(s => compareFetchInput(s.url, url));

        if (cached && opts.skipPending) {
            return {
                ...cached,
                isCached: true,
            };
        }

        let r;
        if (opts.useCache && opts.requestHasher) {
            const hash = opts.requestHasher(url);
            if (requestCache[hash]) {
                r = requestCache[hash];
            } else {
                r = fetchCall(url, rHash || undefined);
                requestCache[hash] = r;
            }
        } else {
            r = fetchCall(url, rHash || undefined);
        }

        return {
            request: r,
            requestHash: rHash,
            url,
            isCached: false,
        };

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
        requestStream: reqStream.map(r => r.request)
            .awaitPromises()
            .map(r => [r[1].clone(), r[2], r[0]] as [Response, requestHash, IFetchStreamInput])
            .multicast(),
        pendingStream,
    };
}
