import * as find from '../utils/find';
import * as graphics from '../utils/graphics';
import * as date from '../utils/date';
import PlannerDate from '../utils/planner-date';
import Task from '../models/task';
import EndTaskPrompt from './components/end-task-prompt';
import NewTaskPrompt from './components/new-task-prompt';
import UpdateTaskPrompt from './components/update-task-prompt';
import './planner.css';

export default class WeekPlanner {
    private headers: HTMLElement;
    private tasks: HTMLElement;
    private headerTemplate: HTMLTemplateElement;
    private taskTemplate: HTMLTemplateElement;
    private taskList: HTMLElement[];

    newTaskPrompt: NewTaskPrompt;
    updateTaskPrompt: UpdateTaskPrompt;
    endTaskPrompt: EndTaskPrompt;

    constructor(body: HTMLElement) {
        this.headers = find.byId(body, "planner-background");
        this.tasks = find.byId(body, "planner-tasks");
        this.headerTemplate = find.templateById(body, "header-tpl");
        this.taskTemplate = find.templateById(body, "task-tpl");
        this.newTaskPrompt = new NewTaskPrompt(find.byId(body, "new-task-prompt"));
        this.updateTaskPrompt = new UpdateTaskPrompt(find.byId(body, "update-task-prompt"));
        this.endTaskPrompt = new EndTaskPrompt(find.byId(body, "end-task-prompt"));
        this.taskList = [];
    }

    async render(days: PlannerDate[], tasks: Task[]) {
        await graphics.nextFrame();

        this.clear();
        this.headers.append(...this.makeHeaders(days));

        this.taskList = this.makeTasks(days, tasks);
        this.tasks.append(...this.taskList);
    }

    clear() {
        while (this.headers.firstChild) {
            this.headers.removeChild(this.headers.firstChild);
        }

        while (this.tasks.firstChild) {
            this.tasks.removeChild(this.tasks.firstChild);
        }
    }

    unfocus() {
        this.taskList.forEach(t => t.classList.remove("focus"));
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

            para.innerHTML = `${day.toShortDay()} ${day.toNumber()}`;
            para.title = day.toString();

            header.title = day.toString();

            return header;
        });
    }

    private makeTasks(days: PlannerDate[], tasks: Task[]): HTMLElement[] {
        let today = days.findIndex(d => d.isToday(new Date()));
        if (today == -1) {
            today = days.length - 1;
        }

        return tasks.reduce<HTMLElement[]>((accumulator: HTMLElement[], t: Task) => {
            if (!this.taskTemplate.content.firstElementChild) {
                console.error("header template did not contain a valid HTML element");
                return accumulator;
            }

            const startDay = days.findIndex(d => d.isToday(t.getStart()));
            const beforeStart = startDay === -1;

            let endDay = days.findIndex(d => {
                const end = t.getEnd();
                return end !== undefined && d.isToday(end)
            });
            const afterEnd = t.getEnd() !== undefined && endDay === -1;
            if (endDay === -1) {
                endDay = today;
            }

            const task = <HTMLDivElement>this.taskTemplate.content.firstElementChild.cloneNode(true);

            const para = task.querySelector("p");
            if (!para) {
                console.error("expected task template to contain a paragraph!");
                return accumulator;
            }

            para.innerHTML = t.getContent();

            const startLocation = beforeStart ? 0 : (startDay + days[startDay].getDayFraction(t.getStart())) / days.length;
            const endLocation = afterEnd ? 0 : 1 - ((endDay + days[endDay].getDayFraction(t.getEnd() || new Date())) / days.length);
            const taskLength = (1 - endLocation - startLocation);

            task.title = `Task: ${t.getContent()}\nStart: ${t.getStart().toLocaleTimeString()}`;
            task.setAttribute("style", `margin-left:${startLocation * 100}%;margin-right:${endLocation * 100}%; min-width:${taskLength * 100}%`);

            if (!beforeStart) {
                task.classList.add("started");
            }

            if (t.isEnded() && !afterEnd) {
                task.classList.add("complete");
            }

            task.onclick = (event) => {
                event.cancelBubble = true;

                if (task.classList.contains("focus")) {
                    this.updateTaskPrompt.open(t);
                } else {
                    this.taskList.forEach(t => t.classList.remove("focus"));
                    task.classList.add("focus");
                }
            };

            const endButton = task.querySelector("button");
            if (!endButton) {
                console.error("expected task template to contain an end button!");
                return accumulator;
            }

            endButton.onclick = (event) => {
                event.cancelBubble = true;
                this.endTaskPrompt.open(t);
            }

            accumulator.push(task);

            return accumulator;
        }, []);
    }
}
