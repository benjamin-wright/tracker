import * as find from '../utils/find';
import * as graphics from '../utils/graphics';
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
        return tasks.reduce<HTMLElement[]>((accumulator: HTMLElement[], t: Task) => {
            if (!this.taskTemplate.content.firstElementChild) {
                console.error("header template did not contain a valid HTML element");
                return accumulator;
            }

            const task = <HTMLDivElement>this.taskTemplate.content.firstElementChild.cloneNode(true);

            const endButton = task.querySelector("button");
            if (!endButton) {
                console.error("expected task template to contain an end button!");
                return accumulator;
            }

            const para = task.querySelector("p");
            if (!para) {
                console.error("expected task template to contain a paragraph!");
                return accumulator;
            }

            para.innerHTML = t.getContent();

            const taskStart = t.getStart();
            const taskEnd = t.getEnd();
            const startMargin = this.getWeekProgress(days, taskStart);
            const endMargin = taskEnd ? 1 - this.getWeekProgress(days, taskEnd) : 1 - this.getWeekProgress(days, new Date());
            const taskLength = (1 - endMargin - startMargin);

            task.setAttribute("style", `margin-left:${startMargin * 100}%;margin-right:${endMargin * 100}%; min-width:${taskLength * 100}%`);
            task.title = `Task: ${t.getContent()}\nStart: ${taskStart.toLocaleTimeString()}`;
            
            if (this.isInRange(days, taskStart)) {
                task.classList.add("started");
            }
            
            if (taskEnd && this.isInRange(days, taskEnd)) {
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

            endButton.onclick = (event) => {
                event.cancelBubble = true;
                this.endTaskPrompt.open(t);
            }

            accumulator.push(task);
            return accumulator;
        }, []);
    }

    private isInRange(days: PlannerDate[], date: Date): boolean {
        const start = days[0].getDate();
        if (date < start) {
            return false;
        }

        const end = new Date(days[days.length - 1].getDate());
        end.setDate(end.getDate() + 1);
        if (date > end) {
            return false;
        }

        return true;
    }

    private getWeekProgress(days: PlannerDate[], date: Date) {
        const start = days[0].getDate();
        if (date < start) {
            return 0;
        }

        const end = new Date(days[days.length - 1].getDate());
        end.setDate(end.getDate() + 1);
        if (date > end) {
            return 1;
        }

        let dayIndex = days.findIndex(d => d.isToday(date));
        return (dayIndex + days[dayIndex].getDayFraction(date)) / days.length
    }
}
