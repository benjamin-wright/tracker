import Tasks from "./models/tasks";
import "./styles.css"
import PlannerDate from "./utils/planner-date";
import Task from "./utils/task";
import NavBar from "./views/nav-bar";
import WeekPlanner from "./views/week-planner";

const navBar = new NavBar(document);
const planner = new WeekPlanner(document);

const tasks = new Tasks(window.localStorage, PlannerDate.ThisWeek());
tasks.load();

const render = () => {
    planner.render(tasks.getDays(), tasks.getTasks());
}

render();

navBar.onNewActivity(() => {
    planner.newTask();
});

planner.onNewTask((t: Task) => {
    tasks.addTask(t);
    tasks.save();
    render();
});

planner.onUpdateTask((t: Task) => {
    tasks.updateTask(t);
    tasks.save();
    render();
});

planner.onDeleteTask((t: Task) => {
    tasks.removeTask(t.getId());
    tasks.save();
    render();
});