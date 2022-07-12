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