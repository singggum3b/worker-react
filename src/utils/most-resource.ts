import {Stream} from "most";
import {create, ISelfEmitStream} from "./most";
import * as objHash from "object-hash";
import {apiCallStreamFactory, IFetchStreamInput, requestHash} from "./most-fetch";

interface IClassType<T> {
    new(...arg: any[]): T;
}

interface IQuery {
    [key: string]: number | string | boolean | undefined,
}

export type CacheInvalidator<T, K extends IQuery> = (r: T[], i: K) => boolean

interface IResourceFactoryOption<T> {
    name: string,
    model: IClassType<T>,
    cacheStorage?: ICacheStore<T>,
    rawProvider?: IRawJSONProvider,
    processJSON(json: any): any[],
}

interface IRawJSONProvider {
    inputStream: ISelfEmitStream<IQuery>,
    outputStream: Stream<[Response, requestHash]>
}

interface IResourceFactoryOutput<T, K extends IQuery> {
    queryStream: ISelfEmitStream<[K, CacheInvalidator<T, K>]>,
    resourceStream: Stream<Promise<T[]>>
}

export interface ICacheStore<T> {
    getSingle: (q: IQuery) => T[],
    getIntersect: (q: IQuery[]) => T[],
    getUnion: (q: IQuery[]) => T[],
    add: (q: IQuery, v: T[]) => void,
}

class CacheStore<T> implements ICacheStore<T> {
    private cache: WeakMap<IQuery, T[]>;
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
        if (cachedQuery) {
            const cachedTArray = this.cache.get(cachedQuery);
            this.cache.set(cachedQuery, (cachedTArray || []).concat(v))
        } else {
            this.hashQueryMap[hash] = q;
            this.cache.set(q, v);
        }
    }

    private getByHash(hash: string): T[] | undefined {
        const cachedQuery = this.hashQueryMap[hash];
        if (cachedQuery) {
            return this.cache.get(cachedQuery);
        }
        return undefined;
    }
}

export function resourceFactory<T, K extends IQuery>(opts: IResourceFactoryOption<T>):
    IResourceFactoryOutput<T, K> {

    const cacheStore: ICacheStore<T> = opts.cacheStorage || new CacheStore<T>();

    const queryStream = create<[K, CacheInvalidator<T, K>]>(opts.name);

    const streamRawCall = create<IFetchStreamInput>("streamRawCall");
    const {} = apiCallStreamFactory(streamRawCall, {
        useCache: true,
        requestHasher: objHash,
    });

    const resourceStream: Stream<Promise<T[]>> = queryStream.map((q) => {
        const response = cacheStore.getSingle(q[0]);
        if (q[1](response, q[0])) {
            return Promise.resolve(response);
        }
        return Promise.resolve([]);
    });

    return {
        queryStream,
        resourceStream,
    }
}
