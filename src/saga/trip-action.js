import TripStore from '../store-domain/trip.store';

export class LoadTripAction {
    static type = "LOAD_TRIPS";
    context: TripStore;
    type: string = LoadTripAction.type;

    constructor(context: TripStore) {
        this.context = context;
    }
}