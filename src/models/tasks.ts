import PlannerDate from "../utils/planner-date";
import Task from "../utils/task";
import { toWeekString } from "../utils/date";

export default class Tasks {
    private days: PlannerDate[];
    private tasks: { [key: string]: Task[] };
    private lookup: { [key: number]: string };
    private changes: string[];
    private storage: Storage;

    constructor(storage: Storage, days: PlannerDate[]) {
        this.days = days;
        this.tasks = {};
        this.lookup = {};
        this.storage = storage;
        this.changes = [];
    }

    getDays(): PlannerDate[] {
        return this.days;
    }

    addTask(task: Task) {
        console.debug(`adding task ${task.getId()}`);
        const key = toWeekString(task.getStart());
        this.lookup[task.getId()] = key;

        if (!this.tasks[key]) {
            this.tasks[key] = [];
        }

        this.tasks[key].push(task);
        this.changes.push(key);
        this.sort(key);
    }

    updateTask(task: Task) {
        console.debug(`updating task ${task.getId()}`);
        const key = toWeekString(task.getStart());
        if (key !== this.lookup[task.getId()]) {
            this.removeTask(task.getId());
            this.addTask(task);
            return;
        }

        const original = this.tasks[key].find((t: Task) => t.getId() === task.getId());
        if (!original) {
            throw new Error(`failed to update task, couldn't find id ${task.getId()}`);
        }

        original.setContent(task.getContent());
        original.setStart(task.getStart());

        this.changes.push(key);
        this.sort(key);
    }

    removeTask(id: number) {
        console.debug(`removing task ${id}`);
        const key = this.lookup[id];

        const index = this.tasks[key].findIndex((t: Task) => t.getId() === id);
        if (index < 0) {
            throw new Error(`failed to remove task, couldn't find id ${id}`);
        }

        this.tasks[key].splice(index, 1);
        if (this.tasks[key].length === 0) {
            delete this.tasks[key];
        }

        delete this.lookup[id];
        this.changes.push(key);
    }

    getTasks(): Task[] {
        const keys: {[key: string]: boolean} = {};

        this.days.forEach((d: PlannerDate) => {
            const key = toWeekString(d.getDate());
            keys[key] = true;
        })

        return Object.keys(keys).filter((key: string) => this.tasks[key]).flatMap((key: string) => this.tasks[key]);
    }

    private sort(key: string) {
        this.tasks[key].sort((a: Task, b: Task) => Math.sign(a.getStart().getTime() - b.getStart().getTime()));
    }

    save() {
        console.debug('saving...');
        this.storage.setItem('planner-last-id', Task.getLastID().toFixed(0));
        this.storage.setItem('planner-lookup', JSON.stringify(this.lookup));
        
        this.changes.forEach((key: string) => {
            if (this.tasks[key]) {
                this.storage.setItem(`planner-key-${key}`, JSON.stringify(this.tasks[key].map((t: Task) => t.toString())));
            } else {
                this.storage.removeItem(`planner-key-${key}`);
            }
        });

        this.changes = [];
    }

    load() {
        console.debug('saving...');
        Task.setLastId(JSON.parse(this.storage.getItem('planner-last-id') || "0"));
        this.lookup = JSON.parse(this.storage.getItem('planner-lookup') || "{}");
        
        const length = this.storage.length;
        for (let index = 0; index < length; index++) {
            const key = this.storage.key(index);
            console.debug(`found key ${key}`);
            
            if (!key?.startsWith("planner-key-")) {
                continue;
            }

            const internalKey = key.replace("planner-key-", "");

            this.tasks[internalKey] = JSON.parse(this.storage.getItem(key) || "[]").map((t: string) => Task.fromString(t));
            console.debug(`loaded: ${JSON.stringify(this.tasks[internalKey])}`);
        }
    }
}