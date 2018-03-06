import { take, call, spawn, put, takeEvery } from "redux-saga/effects";

function* loadTrips({ tripStore }) {
    console.log("LOAD_TRIPS");
    const response = yield fetch("/BRDRestService/BRDRestService.svc/GetAllBus");
    const data = yield response.json();
    tripStore.tripListFromJSON(data);
    return data;
}

export default function* trip() {
    yield takeEvery("LOAD_TRIPS", loadTrips);
}