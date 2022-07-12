let lastId = 1;

export default class Task {
    private id: number;
    private content: string;
    private start: Date;

    constructor(content: string, start: Date | null, id: number | null) {
        this.id = id || lastId++;
        this.content = content;
        this.start = start ? start : new Date();
    }

    getId(): number {
        return this.id;
    }

    getContent(): string {
        return this.content;
    }

    setContent(content: string) {
        this.content = content;
    }

    getStart(): Date {
        return this.start;
    }

    setStart(start: Date) {
        this.start = start;
    }
}