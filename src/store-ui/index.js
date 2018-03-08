import TripStore from '../store-domain/trip.store'

export default class IndexStore {
    tripStore;

    constructor(createSaga) {
        const { dispatch } = createSaga(this);
        this.tripStore = new TripStore(this, dispatch);
    }

}