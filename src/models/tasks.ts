import PlannerDate from "../utils/planner-date";
import Task from "../utils/task";

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
                os.createIndex("start", "start", {unique: false});
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
        const index = store.index("start");

        const start = days[0].getDate();
        const end = new Date(days[days.length - 1].getDate());
        end.setDate(end.getDate() + 1);

        const range = IDBKeyRange.bound(start, end);

        const query = index.openCursor(range);

        return new Promise((resolve, reject) => {
            const tasks: Task[] = [];

            query.onerror = () => reject(new Error(`Failed to fetch tasks: ${query.error?.message}`));
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

    // async getTask(id: number) {

    //     console.debug(`getting task: ${task.getContent()}`);
    //     const transaction = this.database.transaction(["tasks"], "readonly");
    //     const store = transaction.objectStore("tasks");

    //     const query = store.get(id);

    //     return new Promise((resolve, reject) => {
    //         query.onerror = () => {
    //             reject(new Error(`Failed to insert task: ${query.error?.message}`));
    //         };

    //         query.onsuccess = () => {
    //             task.setId(query.result as number);
    //             resolve(task);
    //         };
    //     });
    // }
}

// export default class Tasks {
//     private days: PlannerDate[];


//     private constructor(store: TaskPersistence, days: PlannerDate[]) {
//         this.days = days;
//         this.store = store;
//     }

//     getDays(): PlannerDate[] {
//         return this.days;
//     }


//     updateTask(task: Task) {
//         console.debug(`updating task ${task.getId()}`);
//         const key = toWeekString(task.getStart());

//         if (key !== this.lookup[task.getId()]) {
//             this.removeTask(task.getId());
//             this.addTask(task);
//             return;
//         }

//         const original = this.tasks[key].find((t: Task) => t.getId() === task.getId());
//         if (!original) {
//             throw new Error(`failed to update task, couldn't find id ${task.getId()}`);
//         }

//         original.setContent(task.getContent());
//         original.setStart(task.getStart());

//         this.changes.push(key);
//         this.sort(key);
//     }

//     removeTask(id: number) {
//         console.debug(`removing task ${id}`);
//         const key = this.lookup[id];

//         const index = this.tasks[key].findIndex((t: Task) => t.getId() === id);
//         if (index < 0) {
//             throw new Error(`failed to remove task, couldn't find id ${id}`);
//         }

//         this.tasks[key].splice(index, 1);
//         if (this.tasks[key].length === 0) {
//             delete this.tasks[key];
//         }

//         delete this.lookup[id];
//         this.changes.push(key);
//     }

//     getTasks(): Task[] {
//         const keys: {[key: string]: boolean} = {};

//         this.days.forEach((d: PlannerDate) => {
//             const key = toWeekString(d.getDate());
//             keys[key] = true;
//         })

//         return Object.keys(keys).filter((key: string) => this.tasks[key]).flatMap((key: string) => this.tasks[key]);
//     }

//     private sort(key: string) {
//         this.tasks[key].sort((a: Task, b: Task) => Math.sign(a.getStart().getTime() - b.getStart().getTime()));
//     }

//     save() {
//         console.debug('saving...');
//         this.storage.setItem('planner-last-id', Task.getLastID().toFixed(0));
//         this.storage.setItem('planner-lookup', JSON.stringify(this.lookup));
        
//         this.changes.forEach((key: string) => {
//             if (this.tasks[key]) {
//                 this.storage.setItem(`planner-key-${key}`, JSON.stringify(this.tasks[key].map((t: Task) => t.toString())));
//             } else {
//                 this.storage.removeItem(`planner-key-${key}`);
//             }
//         });

//         this.changes = [];
//     }

//     load() {
//         console.debug('saving...');
//         Task.setLastId(JSON.parse(this.storage.getItem('planner-last-id') || "0"));
//         this.lookup = JSON.parse(this.storage.getItem('planner-lookup') || "{}");
        
//         const length = this.storage.length;
//         for (let index = 0; index < length; index++) {
//             const key = this.storage.key(index);
//             console.debug(`found key ${key}`);
            
//             if (!key?.startsWith("planner-key-")) {
//                 continue;
//             }

//             const internalKey = key.replace("planner-key-", "");

//             this.tasks[internalKey] = JSON.parse(this.storage.getItem(key) || "[]").map((t: string) => Task.fromString(t));
//             console.debug(`loaded: ${JSON.stringify(this.tasks[internalKey])}`);
//         }
//     }
// }