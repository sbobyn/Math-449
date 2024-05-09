import { addIOtoCanvas, get_from_UI } from "../canvas-io.js";
import { SimulationConfig } from "../config.js";
import { clearCanvas, drawFPS, draw_density, initRenderSettings, } from "../render-utils.js";
import { FluidSolver } from "../solver.js";
import { avgFPS, updateAvgFPS } from "../utils.js";
// global vars
let prevTime;
let simconfig;
let solver;
let selectedSmokeColor;
let canvas;
let colorMenu;
var SMOKE_COLOR;
(function (SMOKE_COLOR) {
    SMOKE_COLOR[SMOKE_COLOR["RED"] = 0] = "RED";
    SMOKE_COLOR[SMOKE_COLOR["GREEN"] = 1] = "GREEN";
    SMOKE_COLOR[SMOKE_COLOR["BLUE"] = 2] = "BLUE";
})(SMOKE_COLOR || (SMOKE_COLOR = {}));
function draw() {
    clearCanvas();
    draw_density();
    drawFPS(avgFPS);
}
function step() {
    solver.u_prev.fill(0);
    solver.v_prev.fill(0);
    solver.r_dens_prev.fill(0);
    solver.g_dens_prev.fill(0);
    solver.b_dens_prev.fill(0);
    switch (selectedSmokeColor) {
        case SMOKE_COLOR.RED:
            get_from_UI(solver.r_dens_prev, solver.u_prev, solver.v_prev, simconfig);
            break;
        case SMOKE_COLOR.GREEN:
            get_from_UI(solver.g_dens_prev, solver.u_prev, solver.v_prev, simconfig);
            break;
        case SMOKE_COLOR.BLUE:
            get_from_UI(solver.b_dens_prev, solver.u_prev, solver.v_prev, simconfig);
            break;
        default:
            get_from_UI(solver.r_dens_prev, solver.u_prev, solver.v_prev, simconfig);
            break;
    }
    solver.velStep();
    solver.densSteps();
}
function run(now) {
    const deltaTime = (now - prevTime) / 1000;
    prevTime = now;
    updateAvgFPS(1 / deltaTime);
    step();
    draw();
    requestAnimationFrame(run);
}
function handleColorChange() {
    switch (colorMenu.value) {
        case "red":
            selectedSmokeColor = SMOKE_COLOR.RED;
            break;
        case "blue":
            selectedSmokeColor = SMOKE_COLOR.BLUE;
            break;
        case "green":
            selectedSmokeColor = SMOKE_COLOR.GREEN;
            break;
        default:
            break;
    }
}
export function main() {
    prevTime = performance.now();
    selectedSmokeColor = SMOKE_COLOR.RED;
    // init simulator
    simconfig = new SimulationConfig();
    solver = new FluidSolver(simconfig);
    // init canvas
    canvas = document.getElementById("canvas");
    addIOtoCanvas(canvas);
    initRenderSettings(canvas, solver);
    // init IO
    colorMenu = document.getElementById("color-select");
    colorMenu.onchange = handleColorChange;
    // begin sim
    run(performance.now());
}
