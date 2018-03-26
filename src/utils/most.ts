import symbolObservable from "symbol-observable"
import {from, Observable, Stream, Subscriber} from "most";

function observe(o, callback) {
    return Proxy.revocable(o, {
        set(target, property, value) {
            target[property] = value;
            return callback(property, value);
        },
    });
}

class ProxyObservable<T> implements Observable<T> {

    public name: string;

    private boxed;
    private revoke;

    private subscriberList: Array<Subscriber<T>> = [];

    constructor(name: string) {

        this.name = name;

        const { proxy, revoke } = observe({
            value: null,
        }, (property, value) => {
            this.subscriberList.forEach((subscriber) => {
                try {
                    subscriber.next(value);
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

    public [symbolObservable]() {
        return this;
    }

    public subscribe(subscriber: Subscriber<T>) {
        this.subscriberList.push(subscriber);

        return {
            unsubscribe: () => {
                subscriber.complete();
                this.subscriberList = this.subscriberList.filter(i => i === subscriber);
            },
        }
    }

    public emit = (e) => {
        this.boxed.value = e;
    }
}

export interface ISelfEmitStream<T> extends Stream<T> {
    emit: (e: T) => void
}

export function create(name) {
    const value = new ProxyObservable(name);
    const stream = from(value) as ISelfEmitStream<any>;
    stream.emit = value.emit;
    return stream;
}
