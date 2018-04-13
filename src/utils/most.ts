import symbolObservable from "symbol-observable"
import {from, Observable, Stream, Subscriber, Subscription} from "most";

function observe<T extends object>(o: T, callback: (s: any, v: any) => boolean): { proxy: T, revoke: () => void } {
    return Proxy.revocable(o, {
        set(target: T, property: string, value: any): boolean {
            (target as any)[property] = value;
            return callback(property, value);
        },
    });
}

class ProxyObservable<T> implements Observable<T> {

    public name: string;

    private boxed: { value: T | null };
    private revoke: () => void;

    private subscriberList: Array<Subscriber<T>> = [];

    constructor(name: string) {

        this.name = name;

        const { proxy, revoke } = observe({
            value: null,
        }, (_, value) => {
            console.log(value);
            this.subscriberList.slice(0, 1).forEach((subscriber) => {
                try {
                    subscriber.next(value);
                    subscriber.complete();
                } catch (e) {
                    console.error(e);
                    subscriber.error(e);
                }
            });
            return true;
        });

        this.boxed = proxy;
        this.revoke = revoke;
    }

    public [symbolObservable](): ProxyObservable<T> {
        return this;
    }

    public subscribe(subscriber: Subscriber<T>): Subscription<T>  {
        this.subscriberList.push(subscriber);

        return {
            unsubscribe: (): void => {
                subscriber.complete();
                this.subscriberList = this.subscriberList.filter(i => i === subscriber);
            },
        }
    }

    public destroy(): void {
        this.revoke();
    }

    public emit = (e: T): void => {
        this.boxed.value = e;
    }
}

export interface ISelfEmitStream<T> extends Stream<T> {
    emit: (e: T) => void
}

export function create<T extends (string | number | boolean | object)>(name: string): ISelfEmitStream<T> {
    const value = new ProxyObservable<T>(name);
    const stream = from<T>(value) as ISelfEmitStream<T>;
    stream.emit = value.emit;
    return stream;
}
