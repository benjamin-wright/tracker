import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";

import Tasks from "./tasks";

describe("tasks", () => {
    let tasks: Tasks;

    beforeEach(async () => {
        tasks = await Tasks.create(new IDBFactory());
    });

    describe("addTask", () => {

    });
});
