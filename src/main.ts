import Tasks from "./models/tasks";
import "./styles.css"
import PlannerDate from "./utils/planner-date";
import Task from "./utils/task";
import NavBar from "./views/nav-bar";
import WeekPlanner from "./views/week-planner";

const start = async () => {
    const navBar = new NavBar(document);
    const planner = new WeekPlanner(document.body);
    const days = PlannerDate.ThisWeek();

    const tasks = await Tasks.create(window.indexedDB);
    const render = async () => {
        planner.render(days, await tasks.getTasks(days));
    }

    navBar.onNewActivity(() => {
        planner.newTaskPrompt.open();
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

    planner.endTaskPrompt.onEnd(async (t: Task) => {
        await tasks.updateTask(t);
        await render();
    });

    document.onclick = () => {
        planner.unfocus();
    }

    await render();
};

start();

