import { getWeekStrings } from "../utils/date";
import PlannerDate from "../utils/planner-date";
import Task from "./task";
import { THE_PAST, THE_FUTURE } from "./task";

interface ObjectStores {
    openTasks: IDBObjectStore
    finishedTasks: IDBObjectStore
    finishedTaskLookup: IDBObjectStore
}

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

                const openTasks = db.createObjectStore("open-tasks", { keyPath: "id", autoIncrement: true });
                openTasks.createIndex("start", "start", {unique: false});

                db.createObjectStore("finished-tasks", { keyPath: "id", autoIncrement: true });
                db.createObjectStore("finished-task-lookup");
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

    private getStores(): ObjectStores {
        const transaction = this.database.transaction(["open-tasks", "finished-tasks", "finished-task-lookup"], "readwrite");

        return {
            openTasks: transaction.objectStore("open-tasks"),
            finishedTasks: transaction.objectStore("finished-tasks"),
            finishedTaskLookup: transaction.objectStore("finished-task-lookup")
        }
    }

    async addTask(task: Task): Promise<void> {
        const stores = this.getStores();

        if (task.isEnded()) {
            await this.addTaskToStore(stores.finishedTasks, task);
            await this.addLookup(
                stores.finishedTaskLookup,
                task,
                getWeekStrings(task.getStart(), task.getEnd())
            );
        } else {
            await this.addTaskToStore(stores.openTasks, task);
        }
    }

    private async addTaskToStore(store: IDBObjectStore, task: Task): Promise<void> {
        console.debug(`adding task to ${store.name}: ${task.getContent()}`);

        const request = store.add(task.serialize());

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to insert task: ${request.error?.message}`));
            request.onsuccess = () => resolve();
        });
    }

    private async addLookup(store: IDBObjectStore, task: Task, weeks: string[]): Promise<void[]> {
        console.debug(`adding lookup for weeks ${weeks.join(', ')}`);

        return Promise.all<void>(
            weeks.map(async week => {
                const current = await this.getLookup(store, week);
                const id = task.getId();
                if (!id) {
                    throw new Error(`Failed to add lookup for task ${task.getContent()} with no id`);
                }

                if (current.includes(id)) {
                    return Promise.resolve();
                }

                current.push(id);
                const request = store.put(current, week);

                return new Promise<void>((resolve, reject) => {
                    request.onerror = () => reject(new Error(`Failed to insert task: ${request.error?.message}`));
                    request.onsuccess = () => resolve();
                });
            })
        );
    }

    private async getLookup(store: IDBObjectStore, week: string): Promise<number[]> {
        const request = store.getAll(week);

        return new Promise<number[]>((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to get lookup: ${request.error?.message}`));
            request.onsuccess = () => resolve(request.result || []);
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
        const stores = this.getStores();

        if (task.isEnded()) {
            await this.removeTaskFromStore(stores.finishedTasks, task);
            await this.removeLookup(
                stores.finishedTaskLookup,
                task,
                getWeekStrings(task.getStart(), task.getEnd())
            )
        } else {
            await this.removeTaskFromStore(stores.finishedTasks, task);
        }
    }

    async removeTaskFromStore(store: IDBObjectStore, task: Task): Promise<void> {
        console.debug(`removing task ${task.getId()} from store ${store.name}`);

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

    private async removeLookup(store: IDBObjectStore, task: Task, weeks: string[]): Promise<void[]> {
        console.debug(`adding lookup for weeks ${weeks.join(', ')}`);

        return Promise.all<void>(
            weeks.map(async week => {
                const id = task.getId();
                if (!id) {
                    throw new Error(`Failed to remove lookup for task ${task.getContent()} with no id`)
                }
                const current = await this.getLookup(store, week);
                if (!current.includes(id)) {
                    return Promise.resolve();
                }

                current.splice(current.indexOf(id), 1);

                let request: IDBRequest;

                if (current.length === 0) {
                    request = store.delete(week);
                } else {
                    request = store.put(current, week);
                }

                return new Promise<void>((resolve, reject) => {
                    request.onerror = () => reject(new Error(`Failed to update lookup: ${request.error?.message}`));
                    request.onsuccess = () => resolve();
                });
            })
        );
    }

    async getTasks(days: PlannerDate[]): Promise<Task[]> {
        const transaction = this.database.transaction(["tasks"], "readonly");
        const store = transaction.objectStore("tasks");

        const start = days[0].getDate();
        const end = new Date(days[days.length - 1].getDate());
        end.setDate(end.getDate() + 1);

        const index = store.index("dates");
        const range = IDBKeyRange.bound([THE_PAST, start], [end, THE_FUTURE], true);
        const request = index.openCursor(range);

        return new Promise<Task[]>((resolve, reject) => {
            const tasks: Task[] = [];

            request.onerror = () => reject(new Error(`Failed to fetch start tasks: ${request.error?.message}`));
            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor === null) {
                    resolve(tasks);
                    return;
                }

                tasks.push(Task.deserialize(cursor.value));
                cursor.continue();
            }
        });
    }

    private async getOpenTasks(store: IDBObjectStore, end: Date): Promise<Task[]> {
        const index = store.index("start");
        const request = index.openCursor(IDBKeyRange.upperBound(end));

        return new Promise((resolve, reject) => {
            const tasks: Task[] = [];

            request.onerror = () => reject(new Error(`failed to get open tasks: ${request.error?.message}`));
            request.onsuccess = () => {
                const cursor = request.result;
                if (!cursor) {
                    resolve(tasks);
                    return
                }

                tasks.push(Task.deserialize(cursor.value));
                cursor.continue();
            };
        });
    }
}
