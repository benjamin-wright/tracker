
export default class TaskPersistence {
    static create(indexedDB: IDBFactory): Promise<TaskPersistence> {
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
                db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
                db.createObjectStore("lookup", { keyPath: "week" });
            };

            request.onsuccess = () => {
                resolve(new TaskPersistence(request.result));
            };
        });
    }

    private database: IDBDatabase;

    private constructor(database: IDBDatabase) {
        this.database = database;
    }
}