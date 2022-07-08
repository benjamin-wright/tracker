import "./styles.css"
import PlannerDate from './utils/planner-date';
import NavBar from "./models/nav-bar";
import Planner from "./models/planner";

const navBar = new NavBar(document);

const planner = new Planner(document, PlannerDate.ThisWeek());

planner.render();

window.onresize = () => {
    planner.render();
}

navBar.onNewActivity(() => {
    alert('hi!');
});

