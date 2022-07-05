import * as find from '../utils/find';
import * as graphics from '../utils/graphics';
import './svg.css';

function fix(value: number): string {
    return value.toFixed(0);
}

export default class Planner {
    private plannerSVG: HTMLElement;
    private days: Date[];

    constructor(doc: Document, days: Date[]) {
        this.plannerSVG = find.byId(doc, "planner");
        this.days = days;
        this.render();
    }

    async render() {
        await graphics.nextFrame();

        this.clear();

        if (!this.plannerSVG.parentElement) {
            throw new Error("drawing space can't see its parent");
        }

        const width = this.plannerSVG.parentElement.clientWidth * 0.95;
        const height = width;

        this.plannerSVG.setAttribute("width", width.toFixed(0));
        this.plannerSVG.setAttribute("height", width.toFixed(0));
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

    private headers(width: number, days: Date[]): SVGTextElement[] {
        return days.map((day: Date, index: number) =>
            makeText(width * (index + 0.5) / days.length, 16, DAY_STRINGS[day.getDay()])
        );
    }
}

const DAY_STRINGS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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