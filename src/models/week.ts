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

    addTask(task: Task) {
        this.tasks.push(task);

        this.sort();
    }

    updateTask(task: Task) {
        const original = this.tasks.find((t: Task) => t.getId() === task.getId());
        if (!original) {
            throw new Error(`failed to update task, couldn't find id ${task.getId()}`);
        }

        original.setContent(task.getContent());
        original.setStart(task.getStart());

        this.sort();
    }

    getTasks(): Task[] {
        return this.tasks;
    }

    private sort() {
        this.tasks.sort((a: Task, b: Task) => Math.sign(a.getStart().getTime() - b.getStart().getTime()));
    }
}