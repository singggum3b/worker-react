import {empty, from, just, mergeArray, Stream} from "most";

interface IAPIStreamFactoryResult {
    pendingStream: Stream<IFetchStreamInput[]>,
    requestStream: Stream<Response>
}

interface IStreamFactoryOption {
    skipRepeat?: boolean,
    skipPending?: boolean
}

export interface IFetchStreamInput { 0: string | Request , 1?: RequestInit }
interface IFetchStreamOutput { 0: Stream<IPendingRequestSeed[]>, 1: Stream<Promise<[IFetchStreamInput, Response]>> }

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

function fetchCall(url: IFetchStreamInput): Promise<[IFetchStreamInput, Response]> {
    return fetch(url[0], url[1]).then((res) => {
        return [url, res] as [IFetchStreamInput, Response];
    });
}

export function apiCallStreamFactory(
    src: Stream<IFetchStreamInput>, option: IStreamFactoryOption = { skipRepeat: true, skipPending: true },
): IAPIStreamFactoryResult {

    const urlStream = (option.skipRepeat ? src.skipRepeatsWith(compareFetchInput) : src).multicast();
    const reqStream: Stream<IFetchStreamOutput> = urlStream.
    loop((pending: Stream<IPendingRequestSeed[]>, url: IFetchStreamInput) => {
        const srcStream = pending.take(1);

        const newFetchStream: Stream<Promise<[IFetchStreamInput, Response]>> = srcStream
            .skipWhile((s) => s.some((r) => compareFetchInput(r.url, url)))
            .constant(url)
            .map(fetchCall).multicast();

        const cachedFetchStream: Stream<Promise<[IFetchStreamInput, Response]>> = srcStream
            .takeWhile((s) => s.some((r) => compareFetchInput(r.url, url)))
            .chain(p => from(p))
            .filter(p => p.url === url)
            .map((p) => {
                return p.request;
            }).multicast();

        const fetchStream = (option.skipPending ?
            newFetchStream.merge(cachedFetchStream) : just(url).map(fetchCall)).multicast();

        const addPendingStream: Stream<IPendingRequestSeed[]> = (option.skipPending ? newFetchStream : fetchStream).map((r) => [{url, request: r}]);
        const removePendingStream: Stream<IPendingRequestSeed[]> = fetchStream.awaitPromises().constant([]);
        const addRemoveStream: Stream<IPendingRequestSeed[]> = mergeArray([addPendingStream, removePendingStream]);

        pending = srcStream.combine((p, s) => {
            return p.concat(s);
        }, addRemoveStream).multicast();

        return {
            seed: pending,
            value: [pending, fetchStream] as IFetchStreamOutput,
        }

    }, empty().startWith([])).multicast();

    return {
        requestStream: reqStream.map(r => r[1]).join().awaitPromises().map(t => t[1]).multicast(),
        pendingStream: reqStream.map(r => r[0]).join().map(p => p.map(t => t.url)).multicast(),
    };
}