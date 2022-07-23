import { getDaySuffix, paddedString } from "../utils/date";

const DAYS_MAP_SHORT = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
const DAY_START_TIME = 9;
const DAY_END_TIME = 17;

export default class Day {
    private date: Date;

    constructor(date: Date) {
        this.date = date;
    }

    toShortString(): string {
        return DAYS_MAP_SHORT[this.date.getDay()];
    }

    toDayOfMonth(): string {
        return this.date.getDate().toFixed(0) + getDaySuffix(this.date.getDate());
    }

    toDateString(): string {
        return `${this.date.getFullYear()}-${paddedString(this.date.getMonth() + 1, 2)}-${paddedString(this.date.getDate(), 2)}: ${this.toShortString()}`;
    }

    isToday(date: Date): boolean {
        return this.date.getFullYear() == date.getFullYear() && this.date.getMonth() == date.getMonth() && this.date.getDate() == date.getDate();
    }

    getProgress(date: Date): number {
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
}