import Tasks from "./models/tasks";
import "./styles.css"
import PlannerDate from "./utils/planner-date";
import Task from "./utils/task";
import NavBar from "./views/nav-bar";
import WeekPlanner from "./views/week-planner";

const navBar = new NavBar(document);
const planner = new WeekPlanner(document);

const model = new Tasks(window.localStorage, PlannerDate.ThisWeek());
model.load();

const render = () => {
    planner.render(model.getDays(), model.getTasks());
}

render();

navBar.onNewActivity(() => {
    planner.newTask();
});

planner.onNewTask((t: Task) => {
    model.addTask(t);
    model.save();
    render();
});

planner.onUpdateTask((t: Task) => {
    model.updateTask(t);
    model.save();
    render();
})