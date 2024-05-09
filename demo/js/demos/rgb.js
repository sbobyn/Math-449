import { addIOtoCanvas, get_RGB_from_UI, get_vel_from_UI, } from "../canvas-io.js";
import { SimulationConfig } from "../config.js";
import { clearCanvas, drawFPS, draw_density, initRenderSettings, } from "../render-utils.js";
import { FluidSolver } from "../solver.js";
import { avgFPS, updateAvgFPS } from "../utils.js";
// global vars
let prevTime;
let simconfig;
let solver;
let canvas;
let t = 0;
let a = { r: 0, g: 0, b: 0 };
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
    get_vel_from_UI(solver.u_prev, solver.v_prev, simconfig);
    get_RGB_from_UI(solver.r_dens_prev, solver.g_dens_prev, solver.b_dens_prev, a.r, a.g, a.b, simconfig);
    solver.velStep();
    solver.densSteps();
    // update colors
    t += 0.05;
    a.r = Math.sin(t) * 0.5 + 0.5;
    a.g = Math.sin(t + 2) * 0.5 + 0.5;
    a.b = Math.sin(t + 4) * 0.5 + 0.5;
}
function run(now) {
    const deltaTime = (now - prevTime) / 1000;
    prevTime = now;
    updateAvgFPS(1 / deltaTime);
    step();
    draw();
    requestAnimationFrame(run);
}
export function main() {
    prevTime = performance.now();
    // init simulator
    simconfig = new SimulationConfig(83, 64);
    simconfig.density_dissipation = 0.995;
    simconfig.numIterations = 40;
    solver = new FluidSolver(simconfig);
    // init canvas
    canvas = document.getElementById("canvas");
    addIOtoCanvas(canvas);
    initRenderSettings(canvas, solver);
    // begin sim
    run(performance.now());
}
