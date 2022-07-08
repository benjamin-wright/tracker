import * as find from '../utils/find';

export default class NavBar {
    private newActivityButton: HTMLElement;
    private newActivityCallback: () => void = () => {};

    constructor(doc: Document) {
        this.newActivityButton = find.byId(doc, "new-activity");

        this.newActivityButton.onclick = () => { this.newActivityCallback(); }
    }

    onNewActivity(callback: () => void) {
        this.newActivityCallback = callback;
    }
}