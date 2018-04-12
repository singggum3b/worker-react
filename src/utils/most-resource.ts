import {from, Stream} from "most";
import {create, ISelfEmitStream} from "./most";
import * as objHash from "object-hash";
import {apiCallStreamFactory, IFetchStreamInput, requestHash} from "./most-fetch";

interface IClassType<T> {
    fromJSON: (json: any) => T;
    new(...arg: any[]): T;
}

interface IModel<T> {
    id: string,
    fromJSON: (json: any) => T
}

interface IQuery {
    [key: string]: number | string | boolean | undefined,
}

export type CacheInvalidator<T, K extends IQuery> = (r: T[], i: K) => boolean

interface IResourceFactoryOption<T extends IModel<T>, K extends IQuery> {
    name: string,
    model: IClassType<T>,
    cacheStorage?: ICacheStore<T>,
    rawProvider?: IRawJSONProvider,
    queryToRequest: (i: K) => IFetchStreamInput,
    processJSON(json: any): any[],
}

interface IRawJSONProvider {
    inputStream: ISelfEmitStream<IQuery>,
    outputStream: Stream<[Response, requestHash]>
}

interface IResourceFactoryOutput<T, K extends IQuery> {
    queryStream: ISelfEmitStream<[K, CacheInvalidator<T, K>]>,
    resourceStream: Stream<Promise<[K, T[]]>>
}

export interface ICacheStore<T> {
    getSingle: (q: IQuery) => T[],
    getIntersect: (q: IQuery[]) => T[],
    getUnion: (q: IQuery[]) => T[],
    add: (q: IQuery, v: T[]) => void,
}

class CacheStore<T> implements ICacheStore<T> {
    private cache: WeakMap<IQuery, Set<T>>;
    private hashQueryMap: {[key: string]: IQuery} = {};

    constructor() {
        this.cache = new WeakMap();
    }

    public getSingle(q: IQuery): T[] {
        const hash: string = objHash(q);
        return this.getByHash(hash) || [];
    }

    public getIntersect(query: IQuery[]): T[] {
        return query.map(q => this.getSingle(q))
            .reduce((r, s) => r.concat(s), []);
    }

    public getUnion(query: IQuery[]): T[] {
        const sorted: T[][] = query.map(q => this.getSingle(q)).sort((a, b) => a.length - b.length);
        return sorted.reduce((res, current: T[]) => {
            if (!res.length) {
                return current;
            }
            return res.filter(i => current.some(c => c === i));
        }, []);
    }

    public add(q: IQuery, v: T[]): void {
        const hash: string = objHash(q);
        const cachedQuery = this.hashQueryMap[hash];
        const cachedTSet = this.cache.get(cachedQuery);
        if (cachedQuery && cachedTSet) {
            v.forEach((item) => cachedTSet.add(item));
        } else {
            this.hashQueryMap[hash] = q;
            this.cache.set(q, new Set(v));
        }
    }

    private getByHash(hash: string): T[] | undefined {
        const cachedQuery = this.hashQueryMap[hash];
        const cachedTSet = this.cache.get(cachedQuery);
        if (cachedQuery && cachedTSet) {
            return Array.from(cachedTSet.values());
        }
        return undefined;
    }
}

export function resourceFactory<T extends IModel<T>, K extends IQuery>(opts: IResourceFactoryOption<T, K>):
    IResourceFactoryOutput<T, K> {

    const cacheStore: ICacheStore<T> = opts.cacheStorage || new CacheStore<T>();

    const queryStream = create<[K, CacheInvalidator<T, K>]>(opts.name);

    const streamRawCall = create<IFetchStreamInput>("streamRawCall");
    const {
        requestStream,
    } = apiCallStreamFactory(streamRawCall, {
        useCache: true,
        requestHasher: objHash,
    });

    const resourceStream: Stream<Promise<[K, T[]]>> = queryStream.map((q: [K, CacheInvalidator<T, K>]) => {
        const response = cacheStore.getSingle(q[0]);
        if (q[1](response, q[0])) {
            return Promise.resolve([q[0], response] as [K, T[]]);
        }

        const newRequestOption = opts.queryToRequest(q[0]);
        const newRawRes = requestStream.since(from(q)).filter((i) => {
            return i[2] === newRequestOption;
        }).take(1);
        const newInstRes = newRawRes
            .map((r) => r[0].clone().json())
            .awaitPromises()
            .map((json: any) => {
                return opts.processJSON(json).map((jsonItem: any) => {
                    return opts.model.fromJSON(jsonItem);
                });
            }).reduce((arr: T[], i: T[]): T[] => {
                return arr.concat(i);
            }, []).then(t => [q[0], t] as [K, T[]]);
        // Trigger raw query
        streamRawCall.emit(newRequestOption);
        // Update cache reference
        newInstRes.then((i) => {
            cacheStore.add(q[0], i[1]);
            console.log(cacheStore);
        });

        return newInstRes;
    }).multicast();

    return {
        queryStream,
        resourceStream,
    }
}
