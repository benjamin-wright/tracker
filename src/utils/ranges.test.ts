import { lastNDays } from './ranges';

describe('lastNDays', () => {
    beforeEach(() => {
        jest.useFakeTimers()
            .setSystemTime(new Date('2022-05-24'))
    });

    afterEach(() => jest.useRealTimers());

    it('should generate 3 days worth of dates', () => {
        expect(lastNDays(3).map(d => ({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() }))).toEqual([
            "2022-07-05"
        ]);
    });
});