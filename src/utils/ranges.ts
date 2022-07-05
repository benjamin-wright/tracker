export class PlannerDate {
    private date: Date;

    static Today(): PlannerDate {
        const today = new Date();
        return new PlannerDate(today.getFullYear(), today.getMonth(), today.getDate());
    }

    constructor(year: number, month: number, day: number) {
        this.date = new Date(year, month, day);
    }

    daysAgo(n: number): PlannerDate {

    }
}

export function lastNDays(n: number): PlannerDate[] {
    const dates = [];

    let last = new Date();
    dates.push(new Date(last.getFullYear(), last.getMonth(), last.getDate()));

    for (let x = 1; x < n; x++) {
        let year = last.getFullYear();
        let month = last.getMonth();
        let day = last.getDate() - 1;

        if (day < 0) {
            month -= 1;
        }

        if (month < 0) {
            year -= 1;
        }

        last = new Date(year, month, day, 0, 0, 0, 0)

        dates.push(last);
    }

    return dates.reverse();
}