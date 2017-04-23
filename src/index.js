import "babel-polyfill";

const WorkerClass = require('worker-loader!./worker/worker');
import WorkerCLI from "./worker-cli";
import UI from "./ui";

const worker = new WorkerClass();
const CLI = WorkerCLI(worker);
window.CLI = CLI;

CLI.init().then(() => {
    UI(CLI);

    CLI.store.subscribe((state) => {
        console.log("state changed", state);
    });

    CLI.store.dispatch({
        type: "TASK_FOR_A",
        finishedTask: 1,
    });
});

