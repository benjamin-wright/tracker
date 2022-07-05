import "./styles.css"
import * as date from './utils/date';
import NavBar from "./models/nav-bar";
import Planner from "./models/planner";

const navBar = new NavBar(document);

const planner = new Planner(document, date.lastNDays(3));
planner.render();

window.onresize = () => {
    planner.render();
}

navBar.onNewActivity(() => {
    alert('hi!');
});

