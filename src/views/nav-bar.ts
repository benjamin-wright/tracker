import * as find from '../utils/find';

export default class NavBar {
    private newActivityCallback: () => void = () => {};
    private nextCallback: () => void = () => {};
    private previousCallback: () => void = () => {};

    constructor(doc: Document) {
        find.byId<HTMLButtonElement>(doc.body, "new-activity").onclick = () => this.newActivityCallback();
        find.byId<HTMLButtonElement>(doc.body, "previous-button").onclick = () => this.previousCallback();
        find.byId<HTMLButtonElement>(doc.body, "next-button").onclick = () => this.nextCallback();
    }

    onNewActivity(callback: () => void) {
        this.newActivityCallback = callback;
    }

    onNext(callback: () => void) {
        this.nextCallback = callback;
    }

    onPrevious(callback: () => void) {
        this.previousCallback = callback;
    }
}