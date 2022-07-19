import { toRFC3339String } from '../../utils/date';
import * as find from '../../utils/find';
import Task from '../../models/task';

export default class UpdateTaskPrompt {
    private task: Task | undefined;
    private section: HTMLElement;
    private form: HTMLFormElement;
    private taskDescription: HTMLInputElement;
    private taskStartDate: HTMLInputElement;
    private taskEndDate: HTMLInputElement;
    private taskEndDateFieldset: HTMLFieldSetElement;
    private taskDelete: HTMLInputElement;
    private updateTaskCallback: (t: Task) => void = (_t: Task) => {};
    private deleteTaskCallback: (t: Task) => void = (_t: Task) => {};

    constructor(section: HTMLElement) {
        this.section = section;
        this.form = find.byId(section, "update-task-form");
        this.taskDescription = find.byId(section, "update-task-description");
        this.taskStartDate = find.byId(section, "update-task-start-date");
        this.taskEndDate = find.byId(section, "update-task-end-date");
        this.taskEndDateFieldset = find.byId(section, "update-task-end-date-fieldset");
        this.taskDelete = find.byId(section, "update-task-delete");

        this.form.onsubmit = (ev: SubmitEvent) => {
            ev.preventDefault();

            if (this.task === undefined) {
                console.error("couldn't update task, task was undefined");
                return;
            }

            this.task.setContent(this.taskDescription.value);
            this.task.setStart(new Date(this.taskStartDate.value));
            if (this.taskEndDate.value) {
                this.task.setEnd(new Date(this.taskEndDate.value));
            }

            if (ev.submitter == this.taskDelete) {
                this.deleteTaskCallback(this.task);
            } else {
                this.updateTaskCallback(this.task);
            }

            this.close();
        };

        this.form.onreset = (_: Event) => {
            this.close();
        };
    }

    onUpdate(callback: (t: Task) => void) {
        this.updateTaskCallback = callback;
    }

    onDelete(callback: (t: Task) => void) {
        this.deleteTaskCallback = callback;
    }

    open(t: Task) {
        this.task = t;
        this.taskDescription.value = t.getContent();
        this.taskStartDate.value = toRFC3339String(t.getStart());

        const end = t.getEnd();
        if (end) {
            this.taskEndDate.value = toRFC3339String(end);
            this.taskEndDateFieldset.classList.remove("hidden");

            this.taskStartDate.oninput = this.taskEndDate.oninput = () => {
                const start = new Date(this.taskStartDate.value);
                const end = new Date(this.taskEndDate.value);

                let message = "";
                if (start.getTime() > end.getTime()) {
                    message = "Task can't end before it has started!";
                }

                this.taskStartDate.setCustomValidity(message);
                this.taskEndDate.setCustomValidity(message);
            }
        }

        this.section.hidden = false;
        this.section.classList.add("popup");
    }

    close() {
        this.task = undefined;
        this.taskDescription.value = "";
        this.taskStartDate.value = "";
        this.taskEndDate.value = "";

        this.taskEndDateFieldset.classList.add("hidden");
        this.section.hidden = true;
        this.section.classList.remove("popup");
    }
}
