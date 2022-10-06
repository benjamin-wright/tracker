import Task from '../models/task';
import Week from '../models/week';
import * as find from '../utils/find';
import * as date from '../utils/date';
import './report.css';

const MILLIS_PER_HOUR = 1000 * 60 * 60;
const MILLIS_PER_DAY = MILLIS_PER_HOUR * 24;

export default class Report {
    private report: HTMLTableElement;
    private reportHeaderTemplate: HTMLTemplateElement;
    private reportItemTemplate: HTMLTemplateElement;

    constructor(body: HTMLElement) {
        this.report = find.byId(body, "report-table");
        this.reportHeaderTemplate = find.byId(body, "report-header");
        this.reportItemTemplate = find.byId(body, "report-item");
    }

    async render(week: Week, tasks: Task[]) {
        this.clear();

        const sortedTasks = [...tasks].sort((a, b) => {
            return (a.getEnd()?.valueOf() || 0) - (b.getEnd()?.valueOf() || 0);
        });

        const finishedTasks: Task[] = [];
        // const ongoingTasks: Task[] = [];
        // const startedTasks: Task[] = [];

        sortedTasks.forEach(t => {
            const end = t.getEnd();
            if (end && week.includes(end)) {
                finishedTasks.push(t);
            // } else if (week.includes(t.getStart())) {
            //     startedTasks.push(t);
            // } else {
            //     ongoingTasks.push(t);
            }
        });

        this.report.append(...this.makeTableRows(finishedTasks, true));
    }

    makeTableRows(tasks: Task[], showEnd: boolean): HTMLTableRowElement[] {
        if (!this.reportHeaderTemplate.content.firstElementChild) {
            throw new Error("report header template did not contain a valid HTML element");
        }
        const header = <HTMLTableRowElement>this.reportHeaderTemplate.content.firstElementChild.cloneNode(true);

        if(!showEnd) {
            const cols = header.getElementsByTagName('th');
            header.removeChild(cols[2]);
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
                const start = t.getStart();
                const end = t.getEnd();
                if (!end) {
                    throw new Error("this shouldn't be possible!");
                }

                cols[1].innerText = `${date.toShortDayString(end)} ${date.toHourString(end)}`;
                
                const elapsed = (end.getTime() - start.getTime());
                if (elapsed / MILLIS_PER_HOUR < 24) {
                    cols[2].innerText = `${Math.round(elapsed / MILLIS_PER_HOUR)} hours`;
                } else {
                    cols[2].innerText = `${Math.round(elapsed / MILLIS_PER_DAY)} days`;
                }
            } else {
                item.removeChild(cols[1]);
            }

            return item;
        });

        return [header, ...items];
    }

    clear() {
        while (this.report.firstChild) {
            this.report.removeChild(this.report.firstChild);
        }
    }
}