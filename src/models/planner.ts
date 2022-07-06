import * as find from '../utils/find';
import * as graphics from '../utils/graphics';
import { PlannerDate } from '../utils/date';
import './svg.css';

export default class Planner {
    private plannerSVG: HTMLElement;
    private days: PlannerDate[];

    constructor(doc: Document, days: PlannerDate[]) {
        this.plannerSVG = find.byId(doc, "planner");
        this.days = days;
    }

    size(): { width: number, height: number } {
        if (!this.plannerSVG.parentElement) {
            throw new Error("drawing space can't see its parent");
        }

        const style = getComputedStyle(this.plannerSVG.parentElement);

        const size = {
            width: this.plannerSVG.parentElement.clientWidth - (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)),
            height: this.plannerSVG.parentElement.clientHeight - (parseFloat(style.paddingTop) + parseFloat(style.paddingBottom))
        }

        console.log(`
            Width (pad): ${parseFloat(style.paddingLeft)} <- ${ this.plannerSVG.parentElement.clientWidth } -> ${style.paddingRight}
            Height (pad): ${parseFloat(style.paddingTop)} <- ${ this.plannerSVG.parentElement.clientHeight } -> ${style.paddingBottom}
            Width: ${size.width} (${style.width})
            Height: ${size.height} (${style.height})

            Calc: ${this.plannerSVG.parentElement.clientHeight} - (${parseFloat(style.paddingTop)} + ${parseFloat(style.paddingBottom)}) = ${this.plannerSVG.parentElement.clientHeight - (parseFloat(style.paddingTop) + parseFloat(style.paddingBottom))}
        `);

        return size
    }

    async render() {
        await graphics.nextFrame();

        this.clear();

        if (!this.plannerSVG.parentElement) {
            throw new Error("drawing space can't see its parent");
        }

        const width = 200 * this.days.length;
        const height = width;

        this.plannerSVG.setAttribute("viewBox", `0 0 ${width} ${height}`);
        this.plannerSVG.setAttribute("width", "100%");
        this.plannerSVG.setAttribute("height", "auto");
        this.plannerSVG.append(...this.grid(width, height, this.days.length));
        this.plannerSVG.append(...this.headers(width, this.days));
    }

    clear() {
        while (this.plannerSVG.firstChild) {
            this.plannerSVG.removeChild(this.plannerSVG.firstChild);
        }
    }

    private grid(width: number, height: number, days: number): SVGLineElement[] {
        const lines = [];

        lines.push(makeLine(0, 0, width, 0), makeLine(0, height, width, height))

        for (let x = 0; x <= days; x++) {
            const ratio = x / days;
            lines.push(makeLine(width * ratio, 0, width * ratio, height))
        }

        return lines;
    }

    private headers(width: number, days: PlannerDate[]): SVGTextElement[] {
        return days.map((day: PlannerDate, index: number) =>
            makeText(width * (index + 0.5) / days.length, 24, day.toShortDay())
        );
    }
}

function makeLine(x1: number, y1: number, x2: number, y2: number): SVGLineElement {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttribute("x1", x1.toFixed(0));
    line.setAttribute("y1", y1.toFixed(0));
    line.setAttribute("x2", x2.toFixed(0));
    line.setAttribute("y2", y2.toFixed(0));
    line.setAttribute("stroke-width", "4");

    return line;
}

function makeText(x: number, y: number, content: string): SVGTextElement {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    text.innerHTML = content;

    text.setAttribute("x", (x - (getTextWidth(content, '16px serif') / 2)).toFixed(0));
    text.setAttribute("y", y.toFixed(0));

    return text;
}

const getTextWidth = (text: string, font: string): number => {
    const element = document.createElement('canvas');
    const context = element.getContext('2d');
    if (context === null) {
        throw new Error("cannot measure text, failed to get context");
    }

    context.font = font;
    return context.measureText(text).width;
}