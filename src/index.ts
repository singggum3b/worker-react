import { configure } from "mobx";
import { UI } from "./ui";

configure({
    enforceActions: true,
});

UI();
