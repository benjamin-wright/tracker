import * as find from '../utils/find';
import * as graphics from '../utils/graphics';
import PlannerDate from '../utils/planner-date';
import './planner.css';

export default class Planner {
    private planner: HTMLElement;
    private headerTemplate: HTMLTemplateElement;

    private days: PlannerDate[];
    private scale: number;

    constructor(doc: Document, days: PlannerDate[], scale: number) {
        this.planner = find.byId(doc, "planner");
        this.headerTemplate = find.templateById(doc, "header-tpl");
        this.days = days;
        this.scale = scale;
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
        return days.map((day: PlannerDate, index: number) => {
            if (!this.headerTemplate.content.firstElementChild) {
                throw new Error("header template did not contain a valid HTML element");
            }

            const header = this.headerTemplate.content.firstElementChild.cloneNode(true);

            const para = header as HTMLParagraphElement;
            para.innerText = day.toShortDay();
            para.title = day.toString();
            return para;
        });
    }
}
