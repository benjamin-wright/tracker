export const THE_PAST = new Date("0000-01-01");
export const THE_FUTURE = new Date("9999-01-02");

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
            end: this.end || THE_FUTURE,
            ... this.id ? { id: this.id } : {}
        }
    }

    static deserialize(data: any): Task {
        return new Task(
            data.content,
            data.start,
            (data.end as Date).getTime() == THE_FUTURE.getTime() ? undefined : data.end,
            data.id
        )
    }
}
