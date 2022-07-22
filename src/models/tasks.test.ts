import "fake-indexeddb/auto";
import Task from "./task";
import Tasks from "./tasks";

describe("tasks", () => {
    let tasks: Tasks;

    beforeEach(async () => {
        tasks = await Tasks.create(new IDBFactory());
    });

    describe("addTask", () => {
        [
            {
                name: "should start empty",
                tasks: [],
                expected: {}
            },
            {
                name: "should create an open task",
                tasks: [
                    new Task("a new task", new Date("2021-05-24T10:00:00.000Z"))
                ],
                expected: {
                    openTasks: [
                        { id: 1, content: "a new task", start: new Date("2021-05-24T10:00:00.000Z") }
                    ]
                }
            },
            {
                name: "should create two open tasks",
                tasks: [
                    new Task("first task", new Date("2021-05-24T10:00:00.000Z")),
                    new Task("second task", new Date("2021-05-24T08:00:00.000Z"))
                ],
                expected: {
                    openTasks: [
                        { id: 1, content: "first task", start: new Date("2021-05-24T10:00:00.000Z") },
                        { id: 2, content: "second task", start: new Date("2021-05-24T08:00:00.000Z") }
                    ]
                }
            },
            {
                name: "should create a finished task",
                tasks: [
                    new Task("a new task", new Date("2021-05-24T10:00:00.000Z"), new Date("2021-05-24T12:00:00.000Z"))
                ],
                expected: {
                    finishedTasks: [
                        { id: 1, content: "a new task", start: new Date("2021-05-24T10:00:00.000Z"), end: new Date("2021-05-24T12:00:00.000Z") }
                    ],
                    lookup: { "2021-5-24": [ 1 ] }
                }
            },
            {
                name: "should create a finished task spanning a week",
                tasks: [
                    new Task("a new task", new Date("2021-05-22T10:00:00.000Z"), new Date("2021-05-25T12:00:00.000Z"))
                ],
                expected: {
                    finishedTasks: [
                        { id: 1, content: "a new task", start: new Date("2021-05-22T10:00:00.000Z"), end: new Date("2021-05-25T12:00:00.000Z") }
                    ],
                    lookup: { "2021-5-17": [ 1 ], "2021-5-24": [ 1 ] }
                }
            },
            {
                name: "should support overlapping finished tasks",
                tasks: [
                    new Task("task 1", new Date("2021-05-22T10:00:00.000Z"), new Date("2021-05-25T12:00:00.000Z")),
                    new Task("task 2", new Date("2021-05-24T10:00:00.000Z"), new Date("2021-06-03T12:00:00.000Z")),
                    new Task("task 3", new Date("2021-05-22T15:00:00.000Z"), new Date("2021-06-02T10:00:00.000Z")),
                ],
                expected: {
                    finishedTasks: [
                        { id: 1, content: "task 1", start: new Date("2021-05-22T10:00:00.000Z"), end: new Date("2021-05-25T12:00:00.000Z") },
                        { id: 2, content: "task 2", start: new Date("2021-05-24T10:00:00.000Z"), end: new Date("2021-06-03T12:00:00.000Z") },
                        { id: 3, content: "task 3", start: new Date("2021-05-22T15:00:00.000Z"), end: new Date("2021-06-02T10:00:00.000Z") }
                    ],
                    lookup: { "2021-5-17": [ 1, 3 ], "2021-5-24": [ 1, 2, 3 ], "2021-5-31": [ 2, 3 ] }
                }
            },
            {
                name: "should number open and finished tasks independently",
                tasks: [
                    new Task("first task", new Date("2021-05-24T10:00:00.000Z")),
                    new Task("second task", new Date("2021-05-24T08:00:00.000Z")),
                    new Task("third task", new Date("2021-05-22T10:00:00.000Z"), new Date("2021-05-25T12:00:00.000Z"))
                ],
                expected: {
                    openTasks: [
                        { id: 1, content: "first task", start: new Date("2021-05-24T10:00:00.000Z") },
                        { id: 2, content: "second task", start: new Date("2021-05-24T08:00:00.000Z") }
                    ],
                    finishedTasks: [
                        { id: 1, content: "third task", start: new Date("2021-05-22T10:00:00.000Z"), end: new Date("2021-05-25T12:00:00.000Z") }
                    ],
                    lookup: { "2021-5-17": [ 1 ], "2021-5-24": [ 1 ] }
                }
            }
        ].forEach(test => {
            it(test.name, async () => {
                for (let i = 0; i < test.tasks.length; i++) {
                    await tasks.addTask(test.tasks[i]);
                }

                expect(await tasks.getAllOpenTasks()).toEqual(test.expected.openTasks || []);
                expect(await tasks.getAllFinishedTasks()).toEqual(test.expected.finishedTasks || []);
                expect(await tasks.getAllLookups()).toEqual(test.expected.lookup || {});
            })
        });
    });

    describe('updateTask', () => {
        [
            {
                name: "should update open tasks",
                existing: [
                    new Task("task 1", new Date("2021-05-24T10:00:00.000Z"), undefined, 1)
                ],
                update: new Task("task 1 (edited)", new Date("2021-05-24T11:00:00.000Z"), undefined, 1),
                expected: {
                    openTasks: [
                        { id: 1, content: "task 1 (edited)", start: new Date("2021-05-24T11:00:00.000Z") }
                    ]
                }
            },
            {
                name: "should update finished task",
                existing: [
                    new Task("task 1", new Date("2021-05-24T10:00:00.000Z"), new Date("2021-05-24T15:00:00.000Z"), 1),
                ],
                update: new Task("task 1 (edited)", new Date("2021-05-24T10:30:00.000Z"), new Date("2021-05-26T15:00:00.000Z"), 1),
                expected: {
                    finishedTasks: [
                        { id: 1, content: "task 1 (edited)", start: new Date("2021-05-24T10:30:00.000Z"), end: new Date("2021-05-26T15:00:00.000Z") }
                    ],
                    lookup: { "2021-5-24": [ 1 ] }
                }
            },
            {
                name: "should move a finished task between weeks",
                existing: [
                    new Task("task 1", new Date("2021-05-24T10:00:00.000Z"), new Date("2021-05-24T15:00:00.000Z"), 1),
                ],
                update: new Task("task 1 (edited)", new Date("2021-05-22T10:30:00.000Z"), new Date("2021-05-26T15:00:00.000Z"), 1),
                expected: {
                    finishedTasks: [
                        { id: 1, content: "task 1 (edited)", start: new Date("2021-05-22T10:30:00.000Z"), end: new Date("2021-05-26T15:00:00.000Z") }
                    ],
                    lookup: { "2021-5-17": [ 1 ], "2021-5-24": [ 1 ] }
                }
            }
        ].forEach(test => {
            it(test.name, async () => {
                for (let i = 0; i < test.existing.length; i++) {
                    await tasks.addTask(test.existing[i]);
                }

                await tasks.updateTask(test.update);

                expect(await tasks.getAllOpenTasks()).toEqual(test.expected.openTasks || []);
                expect(await tasks.getAllFinishedTasks()).toEqual(test.expected.finishedTasks || []);
                expect(await tasks.getAllLookups()).toEqual(test.expected.lookup || {});
            });
        });
    });

    describe('completeTask', () => {

    });
});
