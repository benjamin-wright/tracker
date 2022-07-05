import { lastNDays } from './date';

describe('lastNDays', () => {
    beforeEach(() => {
        jest.useFakeTimers()
            .setSystemTime(new Date('2022-05-25T00:00:00Z'))
    });

    afterEach(() => jest.useRealTimers());

    it('should generate 3 days worth of dates', () => {
        expect(lastNDays(3).map(d => d.toString())).toEqual([
            "2022-05-23: Mon",
            "2022-05-24: Tue",
            "2022-05-25: Wed"
        ]);
    });
});