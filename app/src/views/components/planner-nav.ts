import * as find from '../../utils/find';

export default class PlannerNav {
    private heading: HTMLHeadingElement;
    private newCallback: () => void = () => {};
    private nextCallback: () => void = () => {};
    private previousCallback: () => void = () => {};

    constructor(body: HTMLElement) {
        this.heading = find.byId(body, "planner-heading");
        find.byId<HTMLButtonElement>(body, "planner-new").onclick = () => this.newCallback();
        find.byId<HTMLButtonElement>(body, "planner-previous").onclick = () => this.previousCallback();
        find.byId<HTMLButtonElement>(body, "planner-next").onclick = () => this.nextCallback();
    }

    onNew(callback: () => void) {
        this.newCallback = callback;
    }

    onNext(callback: () => void) {
        this.nextCallback = callback;
    }

    onPrevious(callback: () => void) {
        this.previousCallback = callback;
    }

    update(heading: string) {
        this.heading.innerHTML = heading;
    }

    clear() {
        this.heading.innerHTML = "";
    }
}
