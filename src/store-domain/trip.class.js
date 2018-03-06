import { observable } from 'mobx';

export default class Trip {
    TRIPID;
    @observable TIMEPOINT;
    @observable LATITUDE;
    @observable LONGITUDE;

    constructor({ TRIPID, TIMEPOINT, LATITUDE, LONGITUDE }) {
        this.TRIPID = TRIPID;
        this.TIMEPOINT = TIMEPOINT;
        this.LATITUDE = LATITUDE;
        this.LONGITUDE = LONGITUDE;
    }
}