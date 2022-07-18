const DAYS_MAP_SHORT = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];

const DAY_START_TIME = 9;
const DAY_END_TIME = 17;

function toFixedWidth(n: number): string {
    if (n < 10) {
        return "0" + n.toFixed(0);
    } else {
        return n.toFixed();
    }
}

export default class PlannerDate {
    private date: Date;

    static Today(): PlannerDate {
        const today = new Date();
        return new PlannerDate(today.getFullYear(), today.getMonth(), today.getDate());
    }

    static ThisWeek(): PlannerDate[] {
        let day = new Date();

        // if it's sunday then jump back a day, so that weeks run from mon -> sun instead of sun -> sat
        if (day.getDay() === 0) {
            day.setDate(day.getDate() - 1);
        }

        // wind back to the 0th day (sunday)
        while (day.getDay() > 0) {
            day.setDate(day.getDate() - 1);
        }

        // go forward one
        day.setDate(day.getDate() + 1);

        const days = [];
        while (day.getDay() < 6) {
            days.push(new PlannerDate(day.getFullYear(), day.getMonth(), day.getDate()));
            day.setDate(day.getDate() + 1);
        }
        return days;
    }

    constructor(year: number, month: number, day: number) {
        this.date = new Date(year, month, day);
    }

    daysAgo(n: number): PlannerDate {
        return new PlannerDate(
            this.date.getFullYear(),
            this.date.getMonth(),
            this.date.getDate() - n
        );
    }

    toShortDay(): string {
        return DAYS_MAP_SHORT[this.date.getDay()];
    }

    toString(): string {
        return `${this.date.getFullYear()}-${toFixedWidth(this.date.getMonth() + 1)}-${toFixedWidth(this.date.getDate())}: ${this.toShortDay()}`;
    }

    isToday(date: Date): boolean {
        return this.date.getFullYear() == date.getFullYear() && this.date.getMonth() == date.getMonth() && this.date.getDate() == date.getDate();
    }

    getDayFraction(date: Date): number {
        const hour = date.getHours() + date.getMinutes() / 60;
        const fraction = (hour - DAY_START_TIME) / (DAY_END_TIME - DAY_START_TIME);

        if (fraction < 0) {
            return 0;
        }

        if (fraction > 1) {
            return 1;
        }

        return fraction;
    }

    getDate(): Date {
        return this.date;
    }
}
