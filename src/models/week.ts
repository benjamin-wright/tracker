import Day from "./day";

export default class Week {
    private start: Date;
    private end: Date;
    private weekdays: Day[];

    static ThisWeek(): Week {
        return this.FromDay(new Date());
    }
    
    static FromDay(day: Date): Week {
        let monday = new Date(day);

        // if it's sunday then jump back a day, so that weeks run from mon -> sun instead of sun -> sat
        if (monday.getDay() === 0) {
            monday.setDate(monday.getDate() - 1);
        }

        // wind back to the 0th day (sunday)
        while (monday.getDay() > 0) {
            monday.setDate(monday.getDate() - 1);
        }

        // go forward one
        monday.setDate(monday.getDate() + 1);

        return new Week(monday);
    }

    private constructor(start: Date) {
        this.start = new Date(start);
        this.start.setMilliseconds(0);
        this.start.setSeconds(0);
        this.start.setMinutes(0);
        this.start.setHours(0);

        this.end = new Date(this.start);
        this.end.setDate(this.end.getDate() + 7);

        this.weekdays = [];
        const day = new Date(this.start);
        while (this.weekdays.length < 5) {
            this.weekdays.push(new Day(day));
            day.setDate(day.getDate() + 1);
        }
    }

    days(): Day[] {
        return this.weekdays;
    }

    previousWeek(): Week {
        const date = new Date(this.start);
        date.setDate(date.getDate() - 7);
        
        return new Week(date);
    }

    nextWeek(): Week {
        const date = new Date(this.start);
        date.setDate(date.getDate() + 7);
        
        return new Week(date);
    }

    getProgress(date: Date) {
        if (date < this.start) {
            return 0;
        }

        if (date >= this.end) {
            return 1;
        }

        const index = this.weekdays.findIndex(d => d.isToday(date));
        if (index === -1) {
            return 1;
        }

        return (index + this.weekdays[index].getProgress(date)) / 5;
    }

    includes(date: Date): boolean {
        return date >= this.start && date < this.end;
    }

    getStart(): Date {
        return this.start;
    }

    getEnd(): Date {
        return this.end;
    }
}