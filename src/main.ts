import Week from "./models/week";
import "./styles.css"
import Task from "./utils/task";
import NavBar from "./views/nav-bar";
import Planner from "./views/planner";

const navBar = new NavBar(document);
const planner = new Planner(document);

const model = new Week();
model.addTask(new Task("Hello World!", new Date("2022-07-11T10:00:00")));

const render = () => {
    planner.render(model.getDays(), model.getTasks());
}

render();

navBar.onNewActivity(() => {
    planner.showPopup();
});

planner.onNewTask((t: Task) => {
    model.addTask(t);
    render();
});