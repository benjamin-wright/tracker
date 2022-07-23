import './header-bar.css';
import * as find from '../utils/find';

export default class HeaderBar {
    private button: HTMLButtonElement;

    constructor(body: HTMLElement) {
        this.button = find.byId<HTMLButtonElement>(body, "menu-button");

        this.button.onclick = () => {
            if (this.button.classList.contains("expanded")) {
                this.button.classList.remove("expanded");
            } else {
                this.button.classList.add("expanded");
            }
        }
    }
}