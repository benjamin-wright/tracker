import LocalStorageMock from "../utils/mock-storage";
import PlannerDate from "../utils/planner-date";
import Tasks from "./tasks";

describe('tasks', () => {
    describe('getDays', () => {
        it('should store the provided days', () => {
            const tasks = new Tasks(new LocalStorageMock(), [new PlannerDate(2022, 5, 22)])

            expect(tasks.getDays()).toEqual([new PlannerDate(2022, 5, 22)]);
        });
    });
});