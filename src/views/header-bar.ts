import './header-bar.css';
import * as find from '../utils/find';

export default class HeaderBar {
    private button: HTMLButtonElement;
    private overlay: HTMLDivElement;
    private menu: HTMLDivElement;

    private saveCallback: () => Promise<void> = async () => {};
    private loadCallback: () => Promise<void> = async () => {};

    constructor(body: HTMLElement) {
        this.button = find.byId(body, "menu-button");
        this.overlay = find.byId(body, "header-overlay");
        this.menu = find.byId(body, "header-menu");

        this.button.onclick = () => this.expand();

        find.byId<HTMLButtonElement>(body, "header-save-button").onclick = async () => {
            await this.saveCallback();
            this.expand();
        }
        find.byId<HTMLButtonElement>(body, "header-load-button").onclick = async () => {
            await this.loadCallback();
            this.expand();
        }
    }

    expand() {
        if (this.button.classList.contains("expanded")) {
            this.button.classList.remove("expanded");
            this.overlay.classList.add("off-right");
            this.menu.classList.add("off-right");
        } else {
            this.button.classList.add("expanded");
            this.overlay.classList.remove("off-right");
            this.menu.classList.remove("off-right");
        }
    }

    onSave(callback: () => Promise<void>) {
        this.saveCallback = callback;
    }

    onLoad(callback: () => Promise<void>) {
        this.loadCallback = callback;
    }
}
