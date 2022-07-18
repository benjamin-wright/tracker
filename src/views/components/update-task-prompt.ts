import { toRFC3339String } from '../../utils/date';
import * as find from '../../utils/find';
import Task from '../../utils/task';

export default class UpdateTaskPrompt {
    private section: HTMLElement;
    private form: HTMLFormElement;
    private taskDescription: HTMLInputElement;
    private taskStartDate: HTMLInputElement;
    private taskEndDate: HTMLInputElement;
    private taskId: HTMLInputElement;
    private taskDelete: HTMLInputElement;
    private updateTaskCallback: (t: Task) => void = (_t: Task) => {};
    private deleteTaskCallback: (t: Task) => void = (_t: Task) => {};

    constructor(section: HTMLElement) {
        this.section = section;
        this.form = find.byId(section, "update-task-form");
        this.taskDescription = find.byId(section, "update-task-description") as HTMLInputElement;
        this.taskStartDate = find.byId(section, "update-task-start-date") as HTMLInputElement;
        this.taskEndDate = find.byId(section, "update-task-end-date") as HTMLInputElement;
        this.taskId = find.byId(section, "update-task-id") as HTMLInputElement;
        this.taskDelete = find.byId(section, "update-task-delete") as HTMLInputElement;

        this.form.onsubmit = (ev: SubmitEvent) => {
            ev.preventDefault();

            const task = new Task(
                this.taskDescription.value,
                new Date(this.taskStartDate.value),
                this.taskEndDate.value ? new Date(this.taskEndDate.value) : undefined,
                this.taskId.value ? parseInt(this.taskId.value) : undefined
            );

            if (ev.submitter == this.taskDelete) {
                this.deleteTaskCallback(task);
            } else {
                this.updateTaskCallback(task);
            }

            this.closePopup();
        };

        this.form.onreset = (_: Event) => {
            this.closePopup();
        };
    }

    onUpdate(callback: (t: Task) => void) {
        this.updateTaskCallback = callback;
    }

    onDelete(callback: (t: Task) => void) {
        this.deleteTaskCallback = callback;
    }

    open(t: Task) {
        this.taskId.value = t.getId()?.toFixed(0) || "";
        this.taskDescription.value = t.getContent();
        this.taskStartDate.value = toRFC3339String(t.getStart());

        this.section.hidden = false;
        this.section.classList.add("popup");
    }

    closePopup() {
        this.taskId.value = "";
        this.taskDescription.value = "";
        this.taskStartDate.value = "";

        this.section.hidden = true;
        this.section.classList.remove("popup");
    }
}
