import { toRFC3339String } from '../utils/date';
import * as find from '../utils/find';
import * as graphics from '../utils/graphics';
import PlannerDate from '../utils/planner-date';
import Task from '../utils/task';
import './planner.css';

export default class Planner {
    private headers: HTMLElement;
    private tasks: HTMLElement;
    private popup: HTMLElement;
    private newTaskForm: HTMLFormElement;
    private taskDescription: HTMLInputElement;
    private taskStartDate: HTMLInputElement;
    private taskId: HTMLInputElement;
    private headerTemplate: HTMLTemplateElement;
    private taskTemplate: HTMLTemplateElement;
    private newTaskCallback: (t: Task) => void = (_t: Task) => {};
    private updateTaskCallback: (t: Task) => void = (_t: Task) => {};

    constructor(doc: Document) {
        this.headers = find.byId(doc, "planner-background");
        this.tasks = find.byId(doc, "planner-tasks");
        this.popup = find.byId(doc, "new-action-prompt")
        this.newTaskForm = find.byId(doc, "new-task-form") as HTMLFormElement;
        this.taskDescription = find.byId(doc, "task-description") as HTMLInputElement;
        this.taskStartDate = find.byId(doc, "task-start-date") as HTMLInputElement;
        this.taskId = find.byId(doc, "task-id") as HTMLInputElement;
        this.headerTemplate = find.templateById(doc, "header-tpl");
        this.taskTemplate = find.templateById(doc, "task-tpl");

        this.newTaskForm.onsubmit = (ev: SubmitEvent) => {
            ev.preventDefault();

            const task = new Task(
                this.taskDescription.value,
                new Date(this.taskStartDate.value),
                this.taskId.value ? parseInt(this.taskId.value) : null
            );

            if (this.taskId.value === "") {
                this.newTaskCallback(task);
            } else {
                this.updateTaskCallback(task);
            }

            this.closePopup();
        };

        this.newTaskForm.onreset = (_: Event) => {
            this.taskDescription.value = "";
            this.taskStartDate.value = "";

            this.popup.hidden = true;
            this.popup.classList.remove("popup");
        };
    }

    onNewTask(callback: (t: Task) => void) {
        this.newTaskCallback = callback;
    }

    onUpdateTask(callback: (t: Task) => void) {
        this.updateTaskCallback = callback;
    }

    async render(days: PlannerDate[], tasks: Task[]) {
        await graphics.nextFrame();

        this.clear();
        this.headers.append(...this.makeHeaders(days));
        this.tasks.append(...this.makeTasks(days, tasks));
    }

    clear() {
        while (this.headers.firstChild) {
            this.headers.removeChild(this.headers.firstChild);
        }

        while (this.tasks.firstChild) {
            this.tasks.removeChild(this.tasks.firstChild);
        }
    }

    private makeHeaders(days: PlannerDate[]): Node[] {
        return days.map((day: PlannerDate, _index: number) => {
            if (!this.headerTemplate.content.firstElementChild) {
                throw new Error("header template did not contain a valid HTML element");
            }

            const header = <HTMLDivElement>this.headerTemplate.content.firstElementChild.cloneNode(true);

            const para = header.querySelector("p");
            if (!para) {
                throw new Error("expected header template to contain a paragraph!");
            }

            para.innerHTML = day.toShortDay();
            para.title = day.toString();

            header.title = day.toString();

            return header;
        });
    }

    private makeTasks(days: PlannerDate[], tasks: Task[]): Node[] {
        return tasks.reduce<Node[]>((accumulator: Node[], t: Task) => {
            if (!this.taskTemplate.content.firstElementChild) {
                console.error("header template did not contain a valid HTML element");
                return accumulator;
            }

            const day = days.findIndex(d => d.isToday(t.getStart()));
            if (day == -1) {
                console.error(`task ${t.getContent()} was not in the current week: ${t.getStart().toString()}`);
                return accumulator
            }

            const today = days.findIndex(d => d.isToday(new Date()));
            if (today == -1) {
                console.error(`current day is not in the current week`);
                return accumulator;
            }

            const task = <HTMLDivElement>this.taskTemplate.content.firstElementChild.cloneNode(true);

            const para = task.querySelector("p");
            if (!para) {
                console.error("expected task template to contain a paragraph!");
                return accumulator;
            }

            para.innerHTML = t.getContent();

            const startLocation = (day + days[day].getDayFraction(t.getStart())) / days.length;
            const endLocation = 1 - ((today + days[today].getDayFraction(new Date())) / days.length);

            task.title = `Task: ${t.getContent()}\nStart: ${t.getStart().toLocaleTimeString()}`;
            task.setAttribute("style", `margin-left:${startLocation * 100}%;margin-right:${endLocation * 100}%`);

            task.onclick = () => {
                this.updateTask(t);
            };

            accumulator.push(task);

            return accumulator;
        }, []);
    }

    newTask() {
        this.taskStartDate.value = toRFC3339String(new Date());

        this.popup.hidden = false;
        this.popup.classList.add("popup");
    }

    updateTask(t: Task) {
        this.taskId.value = t.getId().toFixed(0);
        this.taskDescription.value = t.getContent();
        this.taskStartDate.value = toRFC3339String(t.getStart());

        console.log(this.taskId.value);

        this.popup.hidden = false;
        this.popup.classList.add("popup");
    }

    closePopup() {
        this.taskId.value = "";
        this.taskDescription.value = "";
        this.taskStartDate.value = "";

        this.popup.hidden = true;
        this.popup.classList.remove("popup");
    }
}
