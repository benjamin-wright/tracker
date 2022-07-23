import Tasks from "./models/tasks";
import "./styles.css"
import Task from "./models/task";
import HeaderBar from "./views/header-bar";
import WeekPlanner from "./views/week-planner";
import Week from "./models/week";

const start = async () => {
    new HeaderBar(document.body);
    const planner = new WeekPlanner(document.body);
    let week = Week.ThisWeek();

    const tasks = await Tasks.create(window.indexedDB);
    const render = async () => {
        planner.render(week, await tasks.getTasks(week));
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

    document.onclick = () => planner.unfocus();

    await render();
};

start();

