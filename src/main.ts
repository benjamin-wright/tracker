import Week from "./models/week";
import "./styles.css"
import NavBar from "./views/nav-bar";
import Planner from "./views/planner";

const navBar = new NavBar(document);
const planner = new Planner(document);

const model = new Week();
model.addTask("Hello World!");

const render = () => {
    planner.render(model.getDays(), model.getTasks());
}

render();
window.onresize = () => {
    render();
}

navBar.onNewActivity(() => {
    model.addTask("new task!");
    render();
});

