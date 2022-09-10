import Task from '../models/task';
import Week from '../models/week';
import * as find from '../utils/find';
import * as date from '../utils/date';
import './report.css';

export default class Report {
    private finishedTasks: HTMLTableElement;
    private startedTasks: HTMLTableElement;
    private ongoingTasks: HTMLTableElement;

    private reportHeaderTemplate: HTMLTemplateElement;
    private reportItemTemplate: HTMLTemplateElement;

    constructor(body: HTMLElement) {
        this.finishedTasks = find.byId(body, "report-finished");
        this.startedTasks = find.byId(body, "report-started");
        this.ongoingTasks = find.byId(body, "report-ongoing");

        this.reportHeaderTemplate = find.byId(body, "report-header");
        this.reportItemTemplate = find.byId(body, "report-item");
    }

    async render(week: Week, tasks: Task[]) {
        this.clear();

        const sortedTasks = [...tasks].sort((a, b) => {
            return (a.getEnd()?.valueOf() || 0) - (b.getEnd()?.valueOf() || 0);
        });

        const finishedTasks: Task[] = [];
        const ongoingTasks: Task[] = [];
        const startedTasks: Task[] = [];

        sortedTasks.forEach(t => {
            const end = t.getEnd();
            if (end && week.includes(end)) {
                finishedTasks.push(t);
            } else if (week.includes(t.getStart())) {
                startedTasks.push(t);
            } else {
                ongoingTasks.push(t);
            }
        });

        this.finishedTasks.append(...this.makeTableRows(finishedTasks, true));
        this.startedTasks.append(...this.makeTableRows(startedTasks, false));
        this.ongoingTasks.append(...this.makeTableRows(ongoingTasks, false));

    }

    makeTableRows(tasks: Task[], showEnd: boolean): HTMLTableRowElement[] {
        if (!this.reportHeaderTemplate.content.firstElementChild) {
            throw new Error("report header template did not contain a valid HTML element");
        }
        const header = <HTMLTableRowElement>this.reportHeaderTemplate.content.firstElementChild.cloneNode(true);

        if(!showEnd) {
            const cols = header.getElementsByTagName('th');
            header.removeChild(cols[1]);
        }

        if (!this.reportItemTemplate.content.firstElementChild) {
            throw new Error("report item template did not contain a valid HTML element");
        }
        const reportItemTemplate = this.reportItemTemplate.content.firstElementChild;

        const items = tasks.map(t => {
            const item = <HTMLTableRowElement>reportItemTemplate.cloneNode(true);
            const cols = item.getElementsByTagName('td');
            cols[0].innerText = t.getContent();

            if (showEnd) {
                const end = t.getEnd();
                if (!end) {
                    throw new Error("this shouldn't be possible!");
                }

                cols[1].innerText = `${date.toShortDayString(end)} ${date.toHourString(end)}`;
            } else {
                item.removeChild(cols[1]);
            }

            return item;
        });

        return [header, ...items];
    }

    clear() {
        while (this.finishedTasks.firstChild) {
            this.finishedTasks.removeChild(this.finishedTasks.firstChild);
        }
        while (this.startedTasks.firstChild) {
            this.startedTasks.removeChild(this.startedTasks.firstChild);
        }
        while (this.ongoingTasks.firstChild) {
            this.ongoingTasks.removeChild(this.ongoingTasks.firstChild);
        }
    }
}