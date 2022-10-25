import './header-bar.css';
import * as find from '../utils/find';

export default class HeaderBar {
    private button: HTMLButtonElement;
    private overlay: HTMLDivElement;
    private menu: HTMLDivElement;

    private resetCallback: () => Promise<void> = async () => {};
    private saveCallback: () => Promise<void> = async () => {};
    private loadCallback: () => Promise<void> = async () => {};

    constructor(body: HTMLElement) {
        this.button = find.byId(body, "menu-button");
        this.overlay = find.byId(body, "header-overlay");
        this.menu = find.byId(body, "header-menu");

        this.button.onclick = () => this.expand();

        const headerReset = find.byId<HTMLButtonElement>(body, "header-reset");
        let mouseTimeout: NodeJS.Timeout;
        headerReset.onmousedown = () => {
            console.log("mousedown");
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => { headerReset.classList.add("clickable"); }, 2000);
        }
        headerReset.onmouseleave = () => {
            console.log("mouseleave");
            if (headerReset.classList.contains("clickable")) {
                clearTimeout(mouseTimeout);
                headerReset.classList.remove("clickable");
            }
        }
        headerReset.onmouseup = () => {
            console.log("mouseup");
            if (headerReset.classList.contains("clickable")) {
                clearTimeout(mouseTimeout);
                headerReset.classList.remove("clickable");
            }
        }
        headerReset.onclick = async () => {
            console.log("click");
            if (headerReset.classList.contains("clickable")) {
                await this.resetCallback();
                this.expand();
            }
        }
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
            this.overlay.classList.remove("on-screen");
            this.menu.classList.remove("on-screen");
        } else {
            this.button.classList.add("expanded");
            this.overlay.classList.add("on-screen");
            this.menu.classList.add("on-screen");
        }
    }

    onReset(callback: () => Promise<void>) {
        this.resetCallback = callback;
    }

    onSave(callback: () => Promise<void>) {
        this.saveCallback = callback;
    }

    onLoad(callback: () => Promise<void>) {
        this.loadCallback = callback;
    }
}
