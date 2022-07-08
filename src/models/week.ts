import PlannerDate from "../utils/planner-date";
import Task from "../utils/task";

export default class Week {
    private days: PlannerDate[];
    private tasks: Task[]

    constructor() {
        this.days = PlannerDate.ThisWeek();
        this.tasks = [];
    }

    getDays(): PlannerDate[] {
        return this.days;
    }

    addTask(content: string) {
        this.tasks.push(new Task(content, null));
    }

    getTasks(): Task[] {
        return this.tasks;
    }
}