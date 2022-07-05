const DAYS_MAP_SHORT = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];

function toFixedWidth(n: number): string {
    if (n < 10) {
        return "0" + n.toFixed(0);
    } else {
        return n.toFixed();
    }
}

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
        let year = this.date.getFullYear();
        let month = this.date.getMonth();
        let day = this.date.getDate() - n;

        if (day < 0) {
            month -= 1;
        }

        if (month < 0) {
            year -= 1;
        }

        return new PlannerDate(year, month, day);
    }

    toShortDay(): string {
        return DAYS_MAP_SHORT[this.date.getDay()];
    }

    toString(): string {
        return `${this.date.getFullYear()}-${toFixedWidth(this.date.getMonth() + 1)}-${toFixedWidth(this.date.getDate())}: ${this.toShortDay()}`;
    }
}

export function lastNDays(n: number): PlannerDate[] {
    const dates = [];

    let last = PlannerDate.Today()
    dates.push(last);

    for (let x = 1; x < n; x++) {
        last = last.daysAgo(1);
        dates.push(last);
    }

    return dates.reverse();
}