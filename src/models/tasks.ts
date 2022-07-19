import PlannerDate from "../utils/planner-date";
import Task from "./task";
import { THE_PAST, THE_FUTURE } from "./task";

export default class Tasks {
    static create(indexedDB: IDBFactory): Promise<Tasks> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("tracker-tasks", 1);

            request.onerror = event => {
                reject(`Failed to open database with error: ${JSON.stringify(event.target)}`);
            };

            request.onblocked = event => {
                reject(`Failed to open database with blocked: ${JSON.stringify(event.target)}`);
            };

            request.onupgradeneeded = () => {
                console.debug('initialising database...');
                const db = request.result;

                const os = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
                os.createIndex("dates", ["start", "end"], {unique: false});
            };

            request.onsuccess = () => {
                resolve(new Tasks(request.result));
            };
        });
    }

    private database: IDBDatabase;

    private constructor(database: IDBDatabase) {
        this.database = database;
    }

    async addTask(task: Task): Promise<Task> {
        console.debug(`adding task: ${task.getContent()}`);
        const transaction = this.database.transaction(["tasks"], "readwrite");
        const store = transaction.objectStore("tasks");

        const request = store.add(task.serialize());

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to insert task: ${request.error?.message}`));

            request.onsuccess = () => {
                task.setId(request.result as number);
                resolve(task);
            };
        });
    }

    async updateTask(task: Task): Promise<void> {
        console.debug(`updating task ${task.getId()}`);
        const transaction = this.database.transaction(["tasks"], "readwrite");
        const store = transaction.objectStore("tasks");

        const request = store.put(task.serialize());

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to update task: ${request.error?.message}`));
            request.onsuccess = () => resolve()
        });
    }

    async removeTask(task: Task): Promise<void> {
        console.debug(`removing task ${task.getId()}`);
        const transaction = this.database.transaction(["tasks"], "readwrite");
        const store = transaction.objectStore("tasks");

        const id = task.getId();
        if (id === undefined) {
            return Promise.reject(new Error(`Can't delete task with null id: ${task.getContent()}`));
        }

        const request = store.delete(id);

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to delete task: ${request.error?.message}`));
            request.onsuccess = () => resolve();
        });
    }

    async getTasks(days: PlannerDate[]): Promise<Task[]> {
        const transaction = this.database.transaction(["tasks"], "readonly");
        const store = transaction.objectStore("tasks");

        const start = days[0].getDate();
        const end = new Date(days[days.length - 1].getDate());
        end.setDate(end.getDate() + 1);

        const index = store.index("dates");
        const range = IDBKeyRange.bound([THE_PAST, start], [end, THE_FUTURE], true);
        const query = index.openCursor(range);

        return new Promise<Task[]>((resolve, reject) => {
            const tasks: Task[] = [];

            query.onerror = () => reject(new Error(`Failed to fetch start tasks: ${query.error?.message}`));
            query.onsuccess = () => {
                const cursor = query.result;
                if (cursor === null) {
                    resolve(tasks);
                    return;
                }

                tasks.push(Task.deserialize(cursor.value));
                cursor.continue();
            }
        });
    }
}
