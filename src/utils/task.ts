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

    toString(): string {
        return JSON.stringify(this);
    }

    static fromString(value: string): Task {
        const data = JSON.parse(value);
        
        return new Task(
            data.content,
            new Date(data.start),
            data.id
        );
    }

    static setLastId(value: number) {
        lastId = value;
    }

    static getLastID(): number {
        return lastId;
    }
}