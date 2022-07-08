import * as find from '../utils/find';
import * as graphics from '../utils/graphics';
import PlannerDate from '../utils/planner-date';
import Task from '../utils/task';
import './planner.css';

export default class Planner {
    private headers: HTMLElement;
    private tasks: HTMLElement;
    private headerTemplate: HTMLTemplateElement;
    private taskTemplate: HTMLTemplateElement;

    constructor(doc: Document) {
        this.headers = find.byId(doc, "planner-background");
        this.tasks = find.byId(doc, "planner-tasks");
        this.headerTemplate = find.templateById(doc, "header-tpl");
        this.taskTemplate = find.templateById(doc, "task-tpl");
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

            console.info(header);

            return header;
        });
    }

    private makeTasks(days: PlannerDate[], tasks: Task[]): Node[] {
        return tasks.map(t => {
            if (!this.taskTemplate.content.firstElementChild) {
                throw new Error("header template did not contain a valid HTML element");
            }

            const header = <HTMLDivElement>this.taskTemplate.content.firstElementChild.cloneNode(true);

            const para = header.querySelector("p");
            if (!para) {
                throw new Error("expected header template to contain a paragraph!");
            }

            para.innerHTML = t.getContent();
            para.title = t.getContent();

            return header;
        });
    }
}
