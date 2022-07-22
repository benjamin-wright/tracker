import { getWeekStrings } from "../utils/date";
import PlannerDate from "../utils/planner-date";
import Task from "./task";
import TaskDB from "./taskDB";

export default class Tasks {
    static async create(indexedDB: IDBFactory): Promise<Tasks> {
        const db = await TaskDB.create(indexedDB);
        return new Tasks(db);
    }

    private db: TaskDB;

    private constructor(db: TaskDB) {
        this.db = db;
    }

    async addTask(task: Task): Promise<void> {
        if (task.isEnded()) {
            const id = await this.db.addFinishedTask(task);
            await this.db.addLookup(
                id,
                getWeekStrings(task.getStart(), task.getEnd())
            );
        } else {
            await this.db.addOpenTask(task);
        }
    }

    async updateTask(task: Task): Promise<void> {
        if (task.getEnd()) {
            const [ original ] = await this.db.getFinishedTasks([task.getId()]);
            await this.db.removeLookup(task.getId(), getWeekStrings(original.getStart(), original.getEnd()));
    
            await this.db.updateFinishedTask(task);
            await this.db.addLookup(task.getId(), getWeekStrings(task.getStart(), task.getEnd()))
        } else {
            await this.db.updateOpenTask(task);
        }
    }

    async completeTask(task: Task, end: Date): Promise<void> {
        await this.db.removeOpenTask(task);
        task.clearId();
        task.setEnd(end);
        await this.addTask(task);
    }

    async removeTask(task: Task): Promise<void> {
        if (task.isEnded()) {
            await this.db.removeFinishedTask(task);
            await this.db.removeLookup(
                task.getId(),
                getWeekStrings(task.getStart(), task.getEnd())
            )
        } else {
            await this.db.removeOpenTask(task);
        }
    }

    async getTasks(days: PlannerDate[]): Promise<Task[]> {
        const tasks: Task[] = [];

        const today = new Date();
        const end = new Date(days[days.length - 1].getDate());
        end.setDate(end.getDate() + 1);

        const weeks = getWeekStrings(days[0].getDate(), end);
        const ids: number[] = [];
        for (let i = 0; i < weeks.length; i++) {
            const weekTaskIds = await this.db.getLookup(weeks[i]);

            weekTaskIds.forEach(id => {
                if (!ids.includes(id)) {
                    ids.push(id);
                }
            });
        }

        tasks.push(...await this.db.getFinishedTasks(ids));

        if (days[0].getDate() < today) {
            tasks.push(...await this.db.getOpenTasks(end));
        }

        return tasks;
    }

    async getAllOpenTasks(): Promise<Task[]> {
        return this.db.getAllOpenTasks();
    }

    async getAllFinishedTasks(): Promise<Task[]> {
        return this.db.getAllFinishedTasks();
    }

    async getAllLookups(): Promise<{[key: string]: number[]}> {
        return this.db.getAllLookups();
    }
}
