// @flow
import { take, call, spawn, put, takeEvery } from "redux-saga/effects";

import { LoadTripAction } from "./trip-action";

function* loadTrips({ context }: LoadTripAction) {
    const response = yield fetch("/BRDRestService/BRDRestService.svc/GetAllBus");
    const data = yield response.json();
    context.tripListFromJSON(data);
    return data;
}

export default function* trip(): any {
    yield takeEvery(LoadTripAction.type, loadTrips);
}