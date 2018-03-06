import { observable } from 'mobx';
import Trip from '../store-domain/trip.class';

export default class IndexStore {
    tripStore;

    constructor(createSaga) {
        const { dispatch } = createSaga(this);
        this.tripStore = new TripStore(this, dispatch);
    }

}

class TripStore {
    indexStore;
    dispatch;
    @observable tripList = [];

    constructor(indexStore, dispatch) {
        this.indexStore = indexStore;
        this.dispatch = dispatch;
    }

    loadTripList() {
        this.dispatch("LOAD_TRIPS");
    }

    tripListFromJSON(jsonTripList) {
        this.tripList = jsonTripList.map((item) => new Trip(item));
    }
}