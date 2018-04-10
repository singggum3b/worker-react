import {Stream} from "most";
import {create, ISelfEmitStream} from "./most";
import * as objHash from "object-hash";

interface IClassType<T> {
    new(...arg: any[]): T;
}

interface IQuery {
    [key: string]: number | string | boolean,
}

interface IResourceFactoryOption<T, K extends IQuery> {
    name: string,
    model: IClassType<T>,
    sampleQuery: K,
    cacheInvalidator: (query: IQuery, output: T[]) => boolean,
    cacheStorage?: ICacheStore<T>,
}

interface IResourceFactoryOutput<T, K extends IQuery> {
    queryStream: ISelfEmitStream<K>,
    responseStream: Stream<Promise<T[]>>
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

export function resourceFactory<T, K extends IQuery>(opts: IResourceFactoryOption<T, K>):
    IResourceFactoryOutput<T, K> {

    const cacheStore: ICacheStore<T> = opts.cacheStorage || new CacheStore<T>();

    const queryStream = create<K>(opts.name);
    const responseStream: Stream<Promise<T[]>> = queryStream.map((q: K) => {
        const response = cacheStore.getSingle(q);
        if (opts.cacheInvalidator(q, response)) {
            return Promise.resolve(response);
        }
        return Promise.resolve([]);
    });

    return {
        queryStream,
        responseStream,
    }
}
