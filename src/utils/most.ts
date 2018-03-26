import symbolObservable from "symbol-observable"
import {from, Observable, Stream, Subscriber} from "most";
import {IObservableValue, IValueDidChange, observable} from "mobx";

class BridgeObservableBox<T> implements Observable<T> {

    private boxed: IObservableValue<any>;

    constructor(value: any, name: string) {
        this.boxed = observable.shallowBox(value, name);
    }

    public [symbolObservable]() {
        return this;
    }

    public subscribe(subscriber: Subscriber<T>) {
        const unsubscribe = this.boxed.observe((change: IValueDidChange<any>) => {
            try {
                subscriber.next(change.newValue.value);
            } catch (e) {
                console.error(e);
                subscriber.error(e);
            }
        });
        return {
            unsubscribe: () => {
                subscriber.complete();
                unsubscribe();
            },
        }
    }

    public emit = (e) => {
        this.boxed.set({
            value: e,
        });
    }
}

export interface ISelfEmitStream<T> extends Stream<T> {
    emit: (e: T) => void
}

export function create(name) {
    const value = new BridgeObservableBox(null, name);
    const stream = from(value) as ISelfEmitStream<any>;
    stream.emit = value.emit;
    return stream;
}
