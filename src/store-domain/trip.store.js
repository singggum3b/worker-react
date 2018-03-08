import { observable } from 'mobx';
import Trip from '../store-domain/trip.class';
import { LoadTripAction } from "../saga/trip-action";

export default class TripStore {
    indexStore;
    dispatch;
    @observable tripList = [];

    constructor(indexStore, dispatch) {
        this.indexStore = indexStore;
        this.dispatch = dispatch;
    }

    loadTripList() {
        const action = new LoadTripAction(this);
        this.dispatch(action);
    }

    tripListFromJSON(jsonTripList) {
        this.tripList = jsonTripList.map((item) => new Trip(item));
    }
}