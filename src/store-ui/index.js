import TripStore from '../store-domain/trip.store'
import TodoStore from '../store-domain/todo.store'

export default class IndexStore {
    tripStore;
    todoStore;
    dispatch;

    constructor(createSaga) {
        const { dispatch } = createSaga(this);
        this.dispatch = dispatch;
        this.tripStore = new TripStore(this, dispatch);
        this.todoStore = new TodoStore(this, dispatch);
    }

}