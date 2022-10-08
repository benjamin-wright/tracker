import { toRFC3339String } from '../../utils/date';
import * as find from '../../utils/find';
import Task from '../../models/task';

export default class NewTaskPrompt {
    private section: HTMLElement;
    private form: HTMLFormElement;
    private taskDescription: HTMLInputElement;
    private taskStartDate: HTMLInputElement;
    private callback: (t: Task) => void = (_t: Task) => {};

    constructor(section: HTMLElement) {
        this.section = section;
        this.form = find.byId(section, "new-task-form");
        this.taskDescription = find.byId(section, "new-task-description");
        this.taskStartDate = find.byId(section, "new-task-start-date");

        this.form.onsubmit = (ev: SubmitEvent) => {
            ev.preventDefault();

            const task = new Task(
                this.taskDescription.value,
                new Date(this.taskStartDate.value),
                undefined,
                undefined
            );

            this.callback(task);
            this.close();
        };

        this.form.onreset = (_: Event) => {
            this.close();
        };
    }

    onNew(callback: (t: Task) => void) {
        this.callback = callback;
    }

    open() {
        this.taskStartDate.value = toRFC3339String(new Date());
        this.section.hidden = false;
        this.section.classList.add("popup");
        this.section.classList.add("offscreen");
        setTimeout(() => this.section.classList.remove("offscreen"));
    }

    close() {
        this.section.classList.add("offscreen");

        setTimeout(() => {
            this.taskDescription.value = "";
            this.taskStartDate.value = "";
            this.section.hidden = true;
            this.section.classList.remove("popup");
            this.section.classList.remove("offscreen");
        }, 250);
    }
}
