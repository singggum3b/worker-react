import {Stream} from "most";
import {create, ISelfEmitStream} from "./most";
import * as objHash from "object-hash";
import {apiCallStreamFactory, IFetchStreamInput, requestHash} from "./most-fetch";

interface IClassType<T> {
    new(...args: any[]): T;
}

interface IModel<T> {
    id: string,
    fromJSON: (json: any, ...arg: any[]) => T
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
    fromJSON(json: any, ...arg: any[]): T,
}

interface IRawJSONProvider {
    inputStream: ISelfEmitStream<IQuery>,
    outputStream: Stream<[Response, requestHash]>
}

interface IResourceFactoryOutput<T, K extends IQuery> {
    queryStream: ISelfEmitStream<[K, CacheInvalidator<T, K>]>,
    resourceStream: Stream<Promise<IResourceOutput<T, K>>>
}

export interface IResourceOutput<T, K extends IQuery> {
    instanceList: T[],
    rawJSON: any,
    query: K,
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

    public clear(): void {
        this.hashQueryMap = {};
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
    const rawJSONCache: ICacheStore<any> = new CacheStore<any>();

    const queryStream = create<[K, CacheInvalidator<T, K>]>(opts.name);

    const streamRawCall = create<IFetchStreamInput>("streamRawCall");
    const {
        requestStream,
    } = apiCallStreamFactory(streamRawCall, {
        skipRepeat: false,
        useCache: true,
        requestHasher: objHash,
    });

    const resourceStream: Stream<Promise<IResourceOutput<T, K>>> = queryStream.map((q: [K, CacheInvalidator<T, K>]) => {
        const response = cacheStore.getSingle(q[0]);
        if (q[1](response, q[0])) {
            const rawJSON = rawJSONCache.getSingle(q[0])[0];
            return Promise.resolve({
                query: q[0],
                instanceList: response,
                rawJSON,
            });
        }

        const newRequestOption = opts.queryToRequest(q[0]) as any;
        newRequestOption.time = Date.now();
        Object.seal(newRequestOption);
        const newRawRes = requestStream.filter(r => {
            return r[2] === newRequestOption;
        });
        const newInstRes = newRawRes
            .map((r) => r[0].clone().json())
            .awaitPromises()
            .map((json: any) => {
                const instanceList = opts.processJSON(json).map((jsonItem: any) => {
                    return opts.fromJSON(jsonItem);
                });
                return [instanceList, json];
            })
            .take(1)
            .reduce((arr: IResourceOutput<T, K>, i: T[]): IResourceOutput<T, K> => {
                arr.instanceList = arr.instanceList.concat(i[0]);
                arr.query = q[0];
                arr.rawJSON = i[1];
                return arr;
            }, {
                instanceList: [],
                query: {} as any,
                rawJSON: null,
            });
        // Trigger raw query
        streamRawCall.emit(newRequestOption);
        // Update cache reference
        newInstRes.then((i) => {
            rawJSONCache.add(q[0], [i.rawJSON]);
            cacheStore.add(q[0], i.instanceList);
        });

        return newInstRes;
    });

    return {
        queryStream,
        resourceStream,
    }
}
