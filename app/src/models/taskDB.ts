import Task from "./task";

export default class TaskDB {
    static reset(indexedDB: IDBFactory): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase("tracker-tasks");

            request.onerror = event => {
                reject(`Failed to open database with error: ${JSON.stringify(event.target)}`);
            };

            request.onblocked = event => {
                reject(`Failed to open database with blocked: ${JSON.stringify(event.target)}`);
            };

            request.onsuccess = () => {
                resolve();
            }
        });
    }

    static create(indexedDB: IDBFactory): Promise<TaskDB> {
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
                resolve(new TaskDB(request.result));
            };
        });
    }

    private database: IDBDatabase;

    private constructor(database: IDBDatabase) {
        this.database = database;
    }

    private store(store: string): IDBObjectStore {
        const transaction = this.database.transaction(store, "readwrite");
        return transaction.objectStore(store);
    }

    async addOpenTask(task: Task): Promise<number> {
        console.debug(`adding open task: ${task.getContent()}`);
        return this.addTask("open-tasks", task);
    }

    async addFinishedTask(task: Task): Promise<number> {
        console.debug(`adding finished task: ${task.getContent()}`);
        return this.addTask("finished-tasks", task);
    }

    private async addTask(store: string, task: Task): Promise<number> {
        const request = this.store(store).add(task.serialize());

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to insert task: ${request.error?.message}`));
            request.onsuccess = () => resolve(request.result as number);
        });
    }

    async addLookup(id: number, weeks: string[]): Promise<void[]> {
        console.debug(`adding lookup for weeks ${weeks.join(', ')}`);

        return Promise.all<void>(
            weeks.map(async week => {
                const current = await this.getLookup(week);

                if (current.includes(id)) {
                    return Promise.resolve();
                }

                current.push(id);
                const request = this.store("finished-task-lookup").put(current, week);

                return new Promise<void>((resolve, reject) => {
                    request.onerror = () => reject(new Error(`Failed to insert task: ${request.error?.message}`));
                    request.onsuccess = () => resolve();
                });
            })
        );
    }

    async getLookup(week: string): Promise<number[]> {
        const request = this.store("finished-task-lookup").get(week);

        return new Promise<number[]>((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to get lookup: ${request.error?.message}`));
            request.onsuccess = () => resolve(request.result || []);
        });
    }

    async removeLookup(id: number, weeks: string[]): Promise<void[]> {
        console.debug(`adding lookup for weeks ${weeks.join(', ')}`);

        return Promise.all<void>(
            weeks.map(async week => {
                const current = await this.getLookup(week);
                if (!current.includes(id)) {
                    return Promise.resolve();
                }

                current.splice(current.indexOf(id), 1);

                let request: IDBRequest;

                if (current.length === 0) {
                    request = this.store("finished-task-lookup").delete(week);
                } else {
                    request = this.store("finished-task-lookup").put(current, week);
                }

                return new Promise<void>((resolve, reject) => {
                    request.onerror = () => reject(new Error(`Failed to update lookup: ${request.error?.message}`));
                    request.onsuccess = () => resolve();
                });
            })
        );
    }

    async updateOpenTask(task: Task): Promise<void> {
        return this.updateTask(this.store("open-tasks"), task);
    }

    async updateFinishedTask(task: Task): Promise<void> {
        return this.updateTask(this.store("finished-tasks"), task);
    }

    private async updateTask(store: IDBObjectStore, task: Task): Promise<void> {
        const request = store.put(task.serialize());

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to update task: ${request.error?.message}`));
            request.onsuccess = () => resolve();
        });
    }

    async removeOpenTask(task: Task): Promise<void> {
        return this.removeTask(this.store("open-tasks"), task);
    }

    async removeFinishedTask(task: Task): Promise<void> {
        return this.removeTask(this.store("finished-tasks"), task);
    }

    private async removeTask(store: IDBObjectStore, task: Task): Promise<void> {
        console.debug(`removing task ${task.getId()} from store ${store.name}`);

        const id = task.getId();

        const request = store.delete(id);

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to delete task: ${request.error?.message}`));
            request.onsuccess = () => resolve();
        });
    }

    async getFinishedTasks(ids: number[]): Promise<Task[]> {
        return Promise.all<Task>(
            ids.map(id => {
                const request = this.store("finished-tasks").get(id);

                return new Promise((resolve, reject) => {
                    request.onerror = () => reject(new Error(`failed to get finished tasks: ${request.error?.message}`));
                    request.onsuccess = () => {
                        if (request.result) {
                            resolve(Task.deserialize(request.result));
                        } else {
                            reject(new Error(`failed to get finished tasks: not found`));
                        }
                    }
                });
            })
        );
    }

    async getOpenTasks(end: Date): Promise<Task[]> {
        const index = this.store("open-tasks").index("start");
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
        const request = this.store("open-tasks").getAll();

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to get all open tasks: ${request.error?.message}`));
            request.onsuccess = () => resolve(request.result.map(d => Task.deserialize(d)));
        });
    }

    async getAllFinishedTasks(): Promise<Task[]> {
        const request = this.store("finished-tasks").getAll();

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to get all finished tasks: ${request.error?.message}`));
            request.onsuccess = () => resolve(request.result.map(d => Task.deserialize(d)));
        });
    }

    async getAllLookups(): Promise<{[key: string]: number[]}> {
        const store = this.store("finished-task-lookup");
        const request = store.getAllKeys();

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error(`Failed to get lookup keys: ${request.error?.message}`));
            request.onsuccess = async () => {
                const result: {[key: string]: number[]} = {};

                for (let i = 0; i < request.result.length; i++) {
                    const key = request.result[i] as string;
                    result[key] = await this.getLookup(key);
                }

                resolve(result);
            };
        });
    }
}
