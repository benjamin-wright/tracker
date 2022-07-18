export default class Task {
    private id: number | undefined;
    private content: string;
    private start: Date;
    private end: Date | undefined;

    constructor(content: string, start: Date | null, end: Date | undefined, id: number | undefined) {
        this.id = id;
        this.content = content;
        this.start = start ? start : new Date();
        this.end = end;
    }

    getId(): number | undefined {
        return this.id;
    }

    setId(id: number) {
        this.id = id;
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

    getEnd(): Date | undefined {
        return this.end;
    }

    serialize(): any {
        return {
            content: this.content,
            start: this.start,
            ... this.end ? { end: this.end } : {},
            ... this.id ? { id: this.id } : {}
        }
    }

    static deserialize(data: any): Task {
        return new Task(
            data.content,
            data.start,
            data.end,
            data.id
        )
    }
}