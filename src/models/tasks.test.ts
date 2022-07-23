import "fake-indexeddb/auto";
import PlannerDate from "../utils/planner-date";
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
        [
            {
                name: "completed a task",
                task: new Task("task 1", new Date("2021-05-24T10:00:00.000Z"), undefined, 1),
                end: new Date("2021-05-24T12:00:00.000Z"),
                expected: {
                    openTasks: [],
                    finishedTasks: [
                        { id: 1, content: "task 1", start: new Date("2021-05-24T10:00:00.000Z"), end: new Date("2021-05-24T12:00:00.000Z") }
                    ],
                    lookup: { "2021-5-24": [ 1 ] }
                }
            }
        ].forEach(test => {
            it(test.name, async () => {
                await tasks.addTask(test.task);
                await tasks.completeTask(test.task, test.end);

                expect(await tasks.getAllOpenTasks()).toEqual(test.expected.openTasks || []);
                expect(await tasks.getAllFinishedTasks()).toEqual(test.expected.finishedTasks || []);
                expect(await tasks.getAllLookups()).toEqual(test.expected.lookup || {});
            });
        });
    });

    describe('removeTask', () => {
        [
            {
                name: "should remove an open task",
                existing: [
                    new Task("task 1", new Date("2021-05-24T10:00:00.000Z"), undefined, 1),
                    new Task("task 2", new Date("2021-05-24T11:00:00.000Z"), undefined, 2),
                    new Task("task 3", new Date("2021-05-24T12:00:00.000Z"), new Date("2021-05-31T14:00:00.000Z"), 1),
                    new Task("task 4", new Date("2021-05-18T13:00:00.000Z"), new Date("2021-05-25T15:00:00.000Z"), 2),
                ],
                remove: new Task("task 1", new Date("2021-05-24T10:00:00.000Z"), undefined, 1),
                expected: {
                    openTasks: [
                        { id: 2, content: "task 2", start: new Date("2021-05-24T11:00:00.000Z") }
                    ],
                    finishedTasks: [
                        { id: 1, content: "task 3", start: new Date("2021-05-24T12:00:00.000Z"), end: new Date("2021-05-31T14:00:00.000Z") },
                        { id: 2, content: "task 4", start: new Date("2021-05-18T13:00:00.000Z"), end: new Date("2021-05-25T15:00:00.000Z") }
                    ],
                    lookup: {
                        "2021-5-17": [ 2 ],
                        "2021-5-24": [ 1, 2 ],
                        "2021-5-31": [ 1 ]
                    }
                }
            },
            {
                name: "should remove an finished task",
                existing: [
                    new Task("task 1", new Date("2021-05-24T10:00:00.000Z"), undefined, 1),
                    new Task("task 2", new Date("2021-05-24T11:00:00.000Z"), undefined, 2),
                    new Task("task 3", new Date("2021-05-24T12:00:00.000Z"), new Date("2021-05-31T14:00:00.000Z"), 1),
                    new Task("task 4", new Date("2021-05-18T13:00:00.000Z"), new Date("2021-05-25T15:00:00.000Z"), 2),
                ],
                remove: new Task("task 3", new Date("2021-05-24T12:00:00.000Z"), new Date("2021-05-31T14:00:00.000Z"), 1),
                expected: {
                    openTasks: [
                        { id: 1, content: "task 1", start: new Date("2021-05-24T10:00:00.000Z") },
                        { id: 2, content: "task 2", start: new Date("2021-05-24T11:00:00.000Z") }
                    ],
                    finishedTasks: [
                        { id: 2, content: "task 4", start: new Date("2021-05-18T13:00:00.000Z"), end: new Date("2021-05-25T15:00:00.000Z") }
                    ],
                    lookup: {
                        "2021-5-17": [ 2 ],
                        "2021-5-24": [ 2 ],
                    }
                }
            },
        ].forEach(test => {
            it(test.name, async () => {
                for (let i = 0; i < test.existing.length; i++) {
                    await tasks.addTask(test.existing[i]);
                }

                await tasks.removeTask(test.remove);

                expect(await tasks.getAllOpenTasks()).toEqual(test.expected.openTasks || []);
                expect(await tasks.getAllFinishedTasks()).toEqual(test.expected.finishedTasks || []);
                expect(await tasks.getAllLookups()).toEqual(test.expected.lookup || {});
            });
        });
    });

    describe("getTasks", () => {
        beforeEach(async () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2021-05-27T12:00:00.000Z"));

            await tasks.addTask(new Task("spanning", new Date("2021-05-17T10:00:00.000Z")));
            await tasks.addTask(new Task("during", new Date("2021-05-25T10:00:00.000Z")));
            await tasks.addTask(new Task("finished", new Date("2021-05-25T11:00:00.000Z"), new Date("2021-05-26T09:30:00.000Z")));
            await tasks.addTask(new Task("multi-week", new Date("2021-05-18T11:00:00.000Z"), new Date("2021-05-24T12:30:00.000Z")));
            await tasks.addTask(new Task("past", new Date("2021-05-18T11:00:00.000Z"), new Date("2021-05-19T12:30:00.000Z")));
            await tasks.addTask(new Task("future", new Date("2021-06-03T11:00:00.000Z"), new Date("2021-06-04T12:30:00.000Z")));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it("should bring back the right tasks for the current week", async () => {
            const days = PlannerDate.ThisWeek();
            
            expect(await tasks.getTasks(days)).toEqual([
                { "id": 1, "content": "finished", "start": new Date("2021-05-25T11:00:00.000Z"), "end": new Date("2021-05-26T09:30:00.000Z") },
                { "id": 2, "content": "multi-week", "start": new Date("2021-05-18T11:00:00.000Z"), "end": new Date("2021-05-24T12:30:00.000Z") },
                { "id": 1, "content": "spanning", "start": new Date("2021-05-17T10:00:00.000Z") },
                { "id": 2, "content": "during", "start": new Date("2021-05-25T10:00:00.000Z") },             
            ]);
        });

        it("should bring back the right tasks for a future week", async () => {
            const days = PlannerDate.NextWeek(PlannerDate.Today());
            
            expect(await tasks.getTasks(days)).toEqual([
                { "id": 4, "content": "future", "start": new Date("2021-06-03T11:00:00.000Z"), "end": new Date("2021-06-04T12:30:00.000Z") },      
            ]);
        });

        it("should bring back the right tasks for a past week", async () => {
            const days = PlannerDate.PreviousWeek(PlannerDate.Today());
            
            expect(await tasks.getTasks(days)).toEqual([
                { "id": 2, "content": "multi-week", "start": new Date("2021-05-18T11:00:00.000Z"), "end": new Date("2021-05-24T12:30:00.000Z") },
                { "id": 3, "content": "past", "start": new Date("2021-05-18T11:00:00.000Z"), "end": new Date("2021-05-19T12:30:00.000Z") },      
                { "id": 1, "content": "spanning", "start": new Date("2021-05-17T10:00:00.000Z") },
            ]);
        });
    });
});
