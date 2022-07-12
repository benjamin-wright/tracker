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