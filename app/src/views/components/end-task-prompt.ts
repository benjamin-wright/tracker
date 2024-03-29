import { toRFC3339String } from '../../utils/date';
import * as find from '../../utils/find';
import Task from '../../models/task';

export default class EndTaskPrompt {
    private task: Task | undefined;
    private section: HTMLElement;
    private form: HTMLFormElement;
    private taskEndDate: HTMLInputElement;
    private callback: (t: Task, end: Date) => void = () => {};

    constructor(section: HTMLElement) {
        this.section = section;
        this.form = find.byId(section, "end-task-form");
        this.taskEndDate = find.byId(section, "end-task-end-date");

        this.form.onsubmit = (ev: SubmitEvent) => {
            ev.preventDefault();

            if (this.task === undefined) {
                console.error("Can't end task, task was not defined!")
                return;
            }

            this.callback(this.task, new Date(this.taskEndDate.value));
            this.close();
        };

        this.form.onreset = (_: Event) => {
            this.close();
        };
    }

    onEnd(callback: (task: Task, end: Date) => void) {
        this.callback = callback;
    }

    open(task: Task) {
        this.task = task;
        this.taskEndDate.value = toRFC3339String(new Date());

        this.taskEndDate.oninput = () => {
            const start = task.getStart();
            const end = new Date(this.taskEndDate.value);

            if (start.getTime() > end.getTime()) {
                this.taskEndDate.setCustomValidity("Task can't end before it has started!");
                return;
            }

            this.taskEndDate.setCustomValidity("");
        }


        this.section.hidden = false;
        this.section.classList.add("popup");
        this.section.classList.add("offscreen");
        setTimeout(() => this.section.classList.remove("offscreen"));
    }

    close() {
        this.section.classList.add("offscreen");

        setTimeout(() => {
            this.section.hidden = true;
            this.section.classList.remove("popup");
            this.section.classList.remove("offscreen");

            this.task = undefined;
            this.taskEndDate.value = "";
        }, 250);
    }
}
