export default class Task {
    private id: number;
    private content: string;
    private start: Date;
    private end: Date | undefined;

    constructor(content: string, start: Date | null, end: Date | undefined, id: number | undefined) {
        this.id = id || 0;
        this.content = content;
        this.start = start ? start : new Date();
        this.end = end;
    }

    getId(): number {
        return this.id;
    }

    setId(id: number) {
        this.id = id;
    }

    clearId() {
        this.id = 0;
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

    setEnd(end: Date) {
        this.end = end;
    }

    isEnded(): boolean {
        return this.end !== undefined;
    }

    serialize(): any {
        return {
            content: this.content,
            start: this.start,
            ... this.end ? { end: this.end } : {},
            ... this.id > 0 ? { id: this.id } : {}
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
