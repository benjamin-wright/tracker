import PlannerDate from './planner-date';

describe('PlannerDate', () => {
    describe('Today', () => {
        beforeEach(() => {
            jest.useFakeTimers()
                .setSystemTime(new Date('2022-05-25T00:00:00.000Z'))
        });
        afterEach(() => jest.useRealTimers());

        it('should get today\'s date', () => {
            expect(PlannerDate.Today()).toEqual(new PlannerDate(2022, 4, 25));
        });
    });

    describe('days ago', () => {
        it('should return a new PlannerDate from x days ago', () => {
            expect(new PlannerDate(2022, 4, 25).daysAgo(3)).toEqual(new PlannerDate(2022, 4, 22));
        });

        it('should cope with going back a month', () => {
            expect(new PlannerDate(2022, 4, 4).daysAgo(6)).toEqual(new PlannerDate(2022, 3, 28));
        });
    });

    describe('ThisWeek', () => {
        beforeEach(() => {
            jest.useFakeTimers()
                .setSystemTime(new Date('2022-05-25T00:00:00.000Z'))
        });
        afterEach(() => jest.useRealTimers());

        it('should create a week of weekdays', () => {
            expect(PlannerDate.ThisWeek()).toEqual([
                new PlannerDate(2022, 4, 23),
                new PlannerDate(2022, 4, 24),
                new PlannerDate(2022, 4, 25),
                new PlannerDate(2022, 4, 26),
                new PlannerDate(2022, 4, 27),
            ]);
        });

        it('should cross months', () => {
            jest.setSystemTime(new Date('2022-06-01T00:00:00.000Z'))

            expect(PlannerDate.ThisWeek()).toEqual([
                new PlannerDate(2022, 4, 30),
                new PlannerDate(2022, 4, 31),
                new PlannerDate(2022, 5, 1),
                new PlannerDate(2022, 5, 2),
                new PlannerDate(2022, 5, 3),
            ]);
        });

        it('should return the previous week on saturdays', () => {
            jest.setSystemTime(new Date('2022-06-04T00:00:00.000Z'))

            expect(PlannerDate.ThisWeek()).toEqual([
                new PlannerDate(2022, 4, 30),
                new PlannerDate(2022, 4, 31),
                new PlannerDate(2022, 5, 1),
                new PlannerDate(2022, 5, 2),
                new PlannerDate(2022, 5, 3),
            ]);
        });
        
        it('should return the previous week on sundays', () => {
            jest.setSystemTime(new Date('2022-06-05T00:00:00.000Z'))

            expect(PlannerDate.ThisWeek()).toEqual([
                new PlannerDate(2022, 4, 30),
                new PlannerDate(2022, 4, 31),
                new PlannerDate(2022, 5, 1),
                new PlannerDate(2022, 5, 2),
                new PlannerDate(2022, 5, 3),
            ]);
        });
    });
});