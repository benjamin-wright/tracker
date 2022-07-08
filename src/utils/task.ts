export default class Task {
    private content: string
    private start: Date

    constructor(content: string, start: Date | null) {
        this.content = content;
        this.start = start ? start : new Date();
    }

    getContent(): string {
        return this.content;
    }

    getStart(): Date {
        return this.start;
    }
}