import LocalStorageMock from "../utils/mock-storage";
import PlannerDate from "../utils/planner-date";
import Task from "../utils/task";
import Tasks from "./tasks";

const WEEK = [
    new PlannerDate(2022, 6, 11),
    new PlannerDate(2022, 6, 12),
    new PlannerDate(2022, 6, 13),
    new PlannerDate(2022, 6, 14),
    new PlannerDate(2022, 6, 15)
];

describe('tasks', () => {
    beforeEach(() => {
        Task.setLastId(1);
    })
    
    describe('getDays', () => {
        it('should store the provided days', () => {
            const tasks = new Tasks(new LocalStorageMock(), WEEK)
            expect(tasks.getDays()).toEqual(WEEK);
        });
    });

    describe('addTask', () => {
        [
            {
                name: 'it should add a task',
                tasks: () => [
                    new Task("a task", new Date("2022-07-12T12:34:56.000Z"), null, null)
                ],
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "a task", start: new Date("2022-07-12T12:34:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "2",
                    "planner-lookup": JSON.stringify({"1": "2022-7-11"})
                }
            },
            {
                name: 'should add a task with an id',
                tasks: () => [
                    new Task("a task", new Date("2022-07-12T12:34:56.000Z"), null, 12)
                ],
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 12, content: "a task", start: new Date("2022-07-12T12:34:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "1",
                    "planner-lookup": JSON.stringify({"12": "2022-7-11"})
                }
            },
            {
                name: 'should add a task with an id between auto-incremented tasks',
                tasks: () => [
                    new Task("first task", new Date("2022-07-12T12:34:56.000Z"), null, null),
                    new Task("second task", new Date("2022-07-12T12:45:56.000Z"), null, 12),
                    new Task("third task", new Date("2022-07-12T12:50:56.000Z"), null, null)
                ],
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "first task", start: new Date("2022-07-12T12:34:56.000Z"), end: null }),
                        JSON.stringify({ id: 12, content: "second task", start: new Date("2022-07-12T12:45:56.000Z"), end: null }),
                        JSON.stringify({ id: 2, content: "third task", start: new Date("2022-07-12T12:50:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "3",
                    "planner-lookup": JSON.stringify({
                        "1": "2022-7-11",
                        "12": "2022-7-11",
                        "2": "2022-7-11",
                    })
                }
            },
            {
                name: 'should sort by date when added out of sequence',
                tasks: () => [
                    new Task("first task", new Date("2022-07-12T12:34:56.000Z"), null, null),
                    new Task("third task", new Date("2022-07-12T12:50:56.000Z"), null, null),
                    new Task("second task", new Date("2022-07-12T12:45:56.000Z"), null, null)
                ],
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "first task", start: new Date("2022-07-12T12:34:56.000Z"), end: null }),
                        JSON.stringify({ id: 3, content: "second task", start: new Date("2022-07-12T12:45:56.000Z"), end: null }),
                        JSON.stringify({ id: 2, content: "third task", start: new Date("2022-07-12T12:50:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "4",
                    "planner-lookup": JSON.stringify({
                        "1": "2022-7-11",
                        "3": "2022-7-11",
                        "2": "2022-7-11",
                    })
                }
            },
            {
                name: 'should split out tasks by week',
                tasks: () => [
                    new Task("a task", new Date("2022-07-12T12:34:56.000Z"), null, null),
                    new Task("second task", new Date("2022-07-06T13:50:56.000Z"), null, null)
                ],
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "a task", start: new Date("2022-07-12T12:34:56.000Z"), end: null })
                    ]),
                    "planner-key-2022-7-4": JSON.stringify([
                        JSON.stringify({ id: 2, content: "second task", start: new Date("2022-07-06T13:50:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "3",
                    "planner-lookup": JSON.stringify({
                        "1": "2022-7-11",
                        "2": "2022-7-4",
                    })
                }
            }
        ].forEach(test => {
            it(test.name, () => {
                const storage = new LocalStorageMock();

                const tasks = new Tasks(storage, WEEK);
                test.tasks().forEach(task => tasks.addTask(task));
                tasks.save();

                expect(storage.getStore()).toEqual(test.store);
            });
        });
    });

    describe('updateTask', () => {
        [
            {
                name: 'it should update a task',
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "a task", start: new Date("2022-07-12T12:34:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "2",
                    "planner-lookup": JSON.stringify({"1": "2022-7-11"})
                },
                task: () => new Task("new task", new Date("2022-07-12T13:34:56.000Z"), null, 1),
                expected: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "new task", start: new Date("2022-07-12T13:34:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "2",
                    "planner-lookup": JSON.stringify({"1": "2022-7-11"})
                },
            },
            {
                name: 'it should move a task between weeks',
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "a task", start: new Date("2022-07-12T12:34:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "2",
                    "planner-lookup": JSON.stringify({"1": "2022-7-11"})
                },
                task: () => new Task("new task", new Date("2022-07-06T13:34:56.000Z"), null, 1),
                expected: {
                    "planner-key-2022-7-4": JSON.stringify([
                        JSON.stringify({ id: 1, content: "new task", start: new Date("2022-07-06T13:34:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "2",
                    "planner-lookup": JSON.stringify({"1": "2022-7-4"})
                },
            },
            {
                name: 'it should sort after an update',
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "a task", start: new Date("2022-07-12T12:34:56.000Z"), end: null }),
                        JSON.stringify({ id: 2, content: "second task", start: new Date("2022-07-13T12:34:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "3",
                    "planner-lookup": JSON.stringify({"1": "2022-7-11", "2": "2022-7-11"})
                },
                task: () => new Task("should be first", new Date("2022-07-11T12:34:56.000Z"), null, 2),
                expected: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 2, content: "should be first", start: new Date("2022-07-11T12:34:56.000Z"), end: null }),
                        JSON.stringify({ id: 1, content: "a task", start: new Date("2022-07-12T12:34:56.000Z"), end: null })
                    ]),
                    "planner-last-id": "3",
                    "planner-lookup": JSON.stringify({"1": "2022-7-11", "2": "2022-7-11"})
                },
            }
        ].forEach(test => {
            it(test.name, () => {
                const storage = new LocalStorageMock();
                storage.setStore(test.store);

                const tasks = new Tasks(storage, WEEK);
                tasks.load();
                tasks.updateTask(test.task());
                tasks.save();

                expect(storage.getStore()).toEqual(test.expected);
            });
        });
    });

    describe('getTasks', () => {
        [
            {
                name: 'it should return nothing if there are no days',
                days: [],
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "first task", start: new Date("2022-07-12T12:34:56.000Z") }),
                        JSON.stringify({ id: 2, content: "second task", start: new Date("2022-07-13T12:34:56.000Z") })
                    ]),
                    "planner-key-2022-7-4": JSON.stringify([
                        JSON.stringify({ id: 3, content: "third task", start: new Date("2022-07-6T12:34:56.000Z") })
                    ]),
                    "planner-last-id": "4",
                    "planner-lookup": JSON.stringify({"1": "2022-7-11", "2": "2022-7-11", "3": "2022-7-4"})
                },
                expected: []
            },
            {
                name: 'it should only return tasks for days in the current week',
                days: [
                    new PlannerDate(2022, 6, 11)
                ],
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "first task", start: new Date("2022-07-12T12:34:56.000Z") }),
                        JSON.stringify({ id: 2, content: "second task", start: new Date("2022-07-13T12:34:56.000Z") })
                    ]),
                    "planner-key-2022-7-4": JSON.stringify([
                        JSON.stringify({ id: 3, content: "third task", start: new Date("2022-07-6T12:34:56.000Z") })
                    ]),
                    "planner-last-id": "4",
                    "planner-lookup": JSON.stringify({"1": "2022-7-11", "2": "2022-7-11", "3": "2022-7-4"})
                },
                expected: [
                    { id: 1, content: "first task", start: new Date("2022-07-12T12:34:56.000Z"), end: null },
                    { id: 2, content: "second task", start: new Date("2022-07-13T12:34:56.000Z"), end: null },
                ]
            },
            {
                name: 'it should return tasks for multiple weeks when the days span weeks',
                days: [
                    new PlannerDate(2022, 6, 4),
                    new PlannerDate(2022, 6, 11),
                ],
                store: {
                    "planner-key-2022-7-11": JSON.stringify([
                        JSON.stringify({ id: 1, content: "first task", start: new Date("2022-07-12T12:34:56.000Z") }),
                        JSON.stringify({ id: 2, content: "second task", start: new Date("2022-07-13T12:34:56.000Z") })
                    ]),
                    "planner-key-2022-7-4": JSON.stringify([
                        JSON.stringify({ id: 3, content: "third task", start: new Date("2022-07-06T12:34:56.000Z") })
                    ]),
                    "planner-last-id": "4",
                    "planner-lookup": JSON.stringify({"1": "2022-7-11", "2": "2022-7-11", "3": "2022-7-4"})
                },
                expected: [
                    { id: 3, content: "third task", start: new Date("2022-07-06T12:34:56.000Z"), end: null },
                    { id: 1, content: "first task", start: new Date("2022-07-12T12:34:56.000Z"), end: null },
                    { id: 2, content: "second task", start: new Date("2022-07-13T12:34:56.000Z"), end: null },
                ]
            }
        ].forEach(test => {
            it(test.name, () => {
                const storage = new LocalStorageMock();
                storage.setStore(test.store);

                const tasks = new Tasks(storage, test.days);
                tasks.load();
                expect(tasks.getTasks()).toEqual(test.expected);
            });
        });
    });
});