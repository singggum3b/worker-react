
export function updateFinishedTask(taskNumber) {
    return {
        type: "FINISHED_TASK",
        taskNumber,
    }
}