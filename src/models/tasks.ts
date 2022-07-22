import { getWeekStrings } from "../utils/date";
import PlannerDate from "../utils/planner-date";
import Task from "./task";

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
            const id = await this.addTaskToStore(stores.finishedTasks, task);
            await this.addLookup(
                stores.finishedTaskLookup,
                id,
                getWeekStrings(task.getStart(), task.getEnd())
            );
        } else {
            await this.addTaskToStore(stores.openTasks, task);
        }
    }

    private async addTaskToStore(store: IDBObjectStore, task: Task): Promise<number> {
        console.debug(`adding task to ${store.name}: ${task.getContent()}`);

        const request = store.add(task.serialize());

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to insert task: ${request.error?.message}`));
            request.onsuccess = () => resolve(request.result as number);
        });
    }

    private async addLookup(store: IDBObjectStore, id: number, weeks: string[]): Promise<void[]> {
        console.debug(`adding lookup for weeks ${weeks.join(', ')}`);

        return Promise.all<void>(
            weeks.map(async week => {
                const current = await this.getLookup(store, week);

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
        const request = store.get(week);

        return new Promise<number[]>((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to get lookup: ${request.error?.message}`));
            request.onsuccess = () => resolve(request.result || []);
        });
    }

    async updateTask(task: Task): Promise<void> {
        const stores = this.getStores();
        if (task.getEnd()) {
            await this.updateFinishedTask(stores.finishedTasks, stores.finishedTaskLookup, task);
        } else {
            await this.updateTaskInStore(stores.openTasks, task);
        }
    }

    private async updateFinishedTask(store: IDBObjectStore, lookups: IDBObjectStore, task: Task): Promise<void> {
        const [ original ] = await this.getFinishedTasks(store, [task.getId()]);
        await this.removeLookup(lookups, task.getId(), getWeekStrings(original.getStart(), original.getEnd()));

        await this.updateTaskInStore(store, task);
        this.addLookup(lookups, task.getId(), getWeekStrings(task.getStart(), task.getEnd()))
    }

    private async updateTaskInStore(store: IDBObjectStore, task: Task): Promise<void> {
        const request = store.put(task.serialize());

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to update task: ${request.error?.message}`));
            request.onsuccess = () => resolve();
        });
    }

    async completeTask(task: Task, end: Date): Promise<void> {
        await this.removeTask(task);
        task.clearId();
        task.setEnd(end);

        await this.addTask(task)
    }

    async removeTask(task: Task): Promise<void> {
        const stores = this.getStores();

        if (task.isEnded()) {
            await this.removeTaskFromStore(stores.finishedTasks, task);
            await this.removeLookup(
                stores.finishedTaskLookup,
                task.getId(),
                getWeekStrings(task.getStart(), task.getEnd())
            )
        } else {
            await this.removeTaskFromStore(stores.openTasks, task);
        }
    }

    private async removeTaskFromStore(store: IDBObjectStore, task: Task): Promise<void> {
        console.debug(`removing task ${task.getId()} from store ${store.name}`);

        const id = task.getId();

        const request = store.delete(id);

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to delete task: ${request.error?.message}`));
            request.onsuccess = () => resolve();
        });
    }

    private async removeLookup(store: IDBObjectStore, id: number, weeks: string[]): Promise<void[]> {
        console.debug(`adding lookup for weeks ${weeks.join(', ')}`);

        return Promise.all<void>(
            weeks.map(async week => {
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
        const tasks: Task[] = [];

        const stores = this.getStores();
        const today = new Date();
        const end = new Date(days[days.length - 1].getDate());
        end.setDate(end.getDate() + 1);

        const weeks = getWeekStrings(days[0].getDate(), end);
        const ids: number[] = [];
        for (let i = 0; i < weeks.length; i++) {
            const weekTaskIds = await this.getLookup(stores.finishedTaskLookup, weeks[i]);

            weekTaskIds.forEach(id => {
                if (!ids.includes(id)) {
                    ids.push(id);
                }
            });
        }

        tasks.push(...await this.getFinishedTasks(stores.finishedTasks, ids));

        if (days[0].getDate() < today) {
            tasks.push(...await this.getOpenTasks(stores.openTasks, end));
        }

        return tasks;
    }

    private async getFinishedTasks(store: IDBObjectStore, ids: number[]): Promise<Task[]> {
        return Promise.all<Task>(
            ids.map(id => {
                const request = store.get(id);

                return new Promise((resolve, reject) => {
                    request.onerror = () => reject(new Error(`failed to get finished tasks: ${request.error?.message}`));
                    request.onsuccess = () => resolve(Task.deserialize(request.result));
                });
            })
        );
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

    async getAllOpenTasks(): Promise<Task[]> {
        const stores = this.getStores();
        const request = stores.openTasks.getAll();

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to get all open tasks: ${request.error?.message}`));
            request.onsuccess = () => resolve(request.result.map(d => Task.deserialize(d)));
        });
    }

    async getAllFinishedTasks(): Promise<Task[]> {
        const stores = this.getStores();
        const request = stores.finishedTasks.getAll();

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to get all finished tasks: ${request.error?.message}`));
            request.onsuccess = () => resolve(request.result.map(d => Task.deserialize(d)));
        });
    }

    async getAllLookups(): Promise<{[key: string]: number[]}> {
        const stores = this.getStores();
        const request = stores.finishedTaskLookup.getAllKeys();

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to get lookup keys: ${request.error?.message}`));
            request.onsuccess = async () => {
                const result: {[key: string]: number[]} = {};

                for (let i = 0; i < request.result.length; i++) {
                    const key = request.result[i] as string;
                    result[key] = await this.getLookup(stores.finishedTaskLookup, key);
                }

                resolve(result);
            };
        });
    }
}
