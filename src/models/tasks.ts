import PlannerDate from "../utils/planner-date";
import Task from "./task";

export default class Tasks {
    static create(indexedDB: IDBFactory): Promise<Tasks> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("tracker-tasks", 2);

            request.onerror = event => {
                reject(`Failed to open database with error: ${JSON.stringify(event.target)}`);
            };

            request.onblocked = event => {
                reject(`Failed to open database with blocked: ${JSON.stringify(event.target)}`);
            };

            request.onupgradeneeded = () => {
                console.debug('initialising database...');
                const db = request.result;

                let os: IDBObjectStore;

                console.info(db);

                if (db.version === 1) {
                    os = db.transaction("tasks").objectStore("tasks");
                } else {
                    os = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
                    os.createIndex("start", "start", {unique: false});
                }

                os.createIndex("end", ["start", "end"], {unique: false});
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

        const past = new Date("0000-01-01");
        const future = new Date("9999-01-02");
        const start = days[0].getDate();
        const end = new Date(days[days.length - 1].getDate());
        end.setDate(end.getDate() + 1);

        const startIndex = store.index("start");
        const startRange = IDBKeyRange.bound(start, end);
        const startQuery = startIndex.openCursor(startRange);

        const endIndex = store.index("end");
        const endRange = IDBKeyRange.bound([past, start], [end, future], true, true);
        const endQuery = endIndex.openCursor(endRange);

        return (await Promise.all([
            new Promise<Task[]>((resolve, reject) => {
                const tasks: Task[] = [];

                startQuery.onerror = () => reject(new Error(`Failed to fetch start tasks: ${startQuery.error?.message}`));
                startQuery.onsuccess = () => {
                    const cursor = startQuery.result;
                    if (cursor === null) {
                        resolve(tasks);
                        return;
                    }

                    tasks.push(Task.deserialize(cursor.value));
                    cursor.continue();
                }
            }),
            new Promise<Task[]>((resolve, reject) => {
                const tasks: Task[] = [];

                endQuery.onerror = () => reject(new Error(`Failed to fetch end tasks: ${endQuery.error?.message}`));
                endQuery.onsuccess = () => {
                    const cursor = endQuery.result;
                    if (cursor === null) {
                        resolve(tasks);
                        return;
                    }

                    tasks.push(Task.deserialize(cursor.value));
                    cursor.continue();
                }
            }),
        ])).flat(1);
    }
}
