function paddedString(n: number, length: number): string {
    let str = n.toFixed(0);

    while (str.length < length) {
        str = '0' + str;
    }

    return str;
}

export function toRFC3339String(d: Date): string {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();

    const hours = d.getHours();
    const minutes = d.getMinutes();

    return `${
        paddedString(year, 4)
    }-${
        paddedString(month, 2)
    }-${
        paddedString(day, 2)
    }T${
        paddedString(hours, 2)
    }:${
        paddedString(minutes, 2)
    }`;
}

export function toWeekString(d: Date): string {
    let day = new Date(d);

    // wind back to the 0th day (sunday)
    while (day.getDay() > 0) {
        day.setDate(day.getDate() - 1);
    }

    // go forward one
    day.setDate(day.getDate() + 1);

    return `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
}

export function getWeekStrings(start: Date, end: Date | undefined): string[] {
    let week = toWeekString(start);
    if (!end) {
        return [week];
    }
    const last = toWeekString(end);

    const weeks = [ week ];
    const date = new Date(start);

    while (week !== last) {
        date.setDate(date.getDate() + 7);
        week = toWeekString(date);
        weeks.push(week);
    }

    return weeks;
}


export function getDaySuffix(day: number): string {
    switch (day) {
        case 1:
        case 21:
        case 31:
            return "st";
        case 2:
        case 22:
            return "nd";
        case 3:
        case 23:
            return "rd";
        default:
            return "th";
    }
}
