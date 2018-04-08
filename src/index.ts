import {configure, spy} from "mobx";
import { UI } from "./ui";

configure({
    enforceActions: true,
});

spy((event) => {
    if (event.spyReportStart) {
        console.groupCollapsed(event.name);
        console.log(event);
    }
    if (event.spyReportEnd) {
        console.groupEnd();
    }
});

UI();
