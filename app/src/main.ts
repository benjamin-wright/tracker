import Tasks from "./models/tasks";
import "./styles.css"
import Task from "./models/task";
import HeaderBar from "./views/header-bar";
import WeekPlanner from "./views/week-planner";
import Report from "./views/report";
import Week from "./models/week";
import { loadFile, saveFile } from "./utils/io";

const start = async () => {
    const header = new HeaderBar(document.body);
    const planner = new WeekPlanner(document.body);
    const report = new Report(document.body);
    let week = Week.ThisWeek();

    const tasks = await Tasks.create(window.indexedDB);
    const render = async () => {
        const currentTasks = await tasks.getTasks(week);
        planner.render(week, currentTasks);
        report.render(week, currentTasks)
    }

    planner.nav.onNew(() => planner.newTaskPrompt.open());

    planner.nav.onNext(async () => {
        week = week.nextWeek();
        await render();
    });

    planner.nav.onPrevious(async () => {
        week = week.previousWeek();
        await render();
    });

    planner.newTaskPrompt.onNew(async (t: Task) => {
        await tasks.addTask(t);
        await render();
    });

    planner.updateTaskPrompt.onUpdate(async (t: Task) => {
        await tasks.updateTask(t);
        await render();
    });

    planner.updateTaskPrompt.onDelete(async (t: Task) => {
        await tasks.removeTask(t);
        await render();
    });

    planner.endTaskPrompt.onEnd(async (t: Task, end: Date) => {
        await tasks.completeTask(t, end);
        await render();
    });

    header.onSave(async () => {
        const data = {
            finishedTasks: await tasks.getAllFinishedTasks(),
            openTasks: await tasks.getAllOpenTasks(),
            lookup: await tasks.getAllLookups(),
        };

        await saveFile(document, "tasks.json", JSON.stringify(data));
    });

    header.onLoad(async () => {
        const data = await loadFile(document);

        console.log(JSON.parse(data));
    });

    document.onclick = () => planner.unfocus();

    await render();
};

start();

