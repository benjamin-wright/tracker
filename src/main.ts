import Tasks from "./models/tasks";
import "./styles.css"
import PlannerDate from "./utils/planner-date";
import Task from "./utils/task";
import NavBar from "./views/nav-bar";
import WeekPlanner from "./views/week-planner";

const navBar = new NavBar(document);
const planner = new WeekPlanner(document.body);

const tasks = new Tasks(window.localStorage, PlannerDate.ThisWeek());
tasks.load();
Tasks.getDatabase(window.indexedDB, "tasks");

const render = () => {
    planner.render(tasks.getDays(), tasks.getTasks());
}

render();

navBar.onNewActivity(() => {
    planner.newTaskPrompt.open();
});

planner.newTaskPrompt.onNew((t: Task) => {
    tasks.addTask(t);
    tasks.save();
    render();
});

planner.updateTaskPrompt.onUpdate((t: Task) => {
    tasks.updateTask(t);
    tasks.save();
    render();
});

planner.updateTaskPrompt.onDelete((t: Task) => {
    tasks.removeTask(t.getId());
    tasks.save();
    render();
});