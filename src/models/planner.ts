import * as find from '../utils/find';
import * as graphics from '../utils/graphics';
import PlannerDate from '../utils/planner-date';
import './planner.css';

export default class Planner {
    private planner: HTMLElement;
    private headerTemplate: HTMLTemplateElement;

    private days: PlannerDate[];

    constructor(doc: Document, days: PlannerDate[]) {
        this.planner = find.byId(doc, "planner");
        this.headerTemplate = find.templateById(doc, "header-tpl");
        this.days = days;
    }

    async render() {
        await graphics.nextFrame();

        this.clear();
        this.planner.append(...this.headers(this.days));
    }

    clear() {
        while (this.planner.firstChild) {
            this.planner.removeChild(this.planner.firstChild);
        }
    }

    private headers(days: PlannerDate[]): Node[] {
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
}
