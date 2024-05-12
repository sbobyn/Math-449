import { ix } from "./utils.js";
let omx;
let omy;
let mx;
let my;
let mouseDown = false;
let canvasRect;
let win_x;
let win_y;
function updateCanvasRect(canvas) {
    canvasRect = canvas.getBoundingClientRect();
}
function handleMouseDown(e) {
    updateCanvasRect(e.target);
    if (e.button != 0)
        return;
    mouseDown = e.button == 0;
    mx = e.clientX - canvasRect.left;
    omx = mx;
    my = e.clientY - canvasRect.top;
    omy = my;
    // console.log(`mouse ${e.button} down at (${mx}, ${my})`);
}
function handleMouseMove(e) {
    if (!mouseDown)
        return;
    mx = e.clientX - canvasRect.left;
    my = e.clientY - canvasRect.top;
    // console.log(`mouse ${e.button} move at (${mx}, ${my})`);
}
function handleMouseUp(e) {
    if (!mouseDown)
        return;
    mouseDown = false;
    // console.log(`mouse ${e.button} up`);
}
function handleTouchStart(e) {
    e.preventDefault(); // Prevent scrolling and other default actions
    updateCanvasRect(e.target);
    if (e.touches.length > 0) {
        const touch = e.touches[0]; // Get the first touch
        mouseDown = true;
        mx = touch.clientX - canvasRect.left;
        omx = mx;
        my = touch.clientY - canvasRect.top;
        omy = my;
        // console.log(`touch down at (${mx}, ${my})`);
    }
}
function handleTouchMove(e) {
    if (!mouseDown)
        return;
    e.preventDefault(); // Continue to prevent default actions
    const touch = e.touches[0]; // Update with the movement of the first touch
    mx = touch.clientX - canvasRect.left;
    my = touch.clientY - canvasRect.top;
    // console.log(`touch move at (${mx}, ${my})`);
}
function handleTouchEnd(e) {
    mouseDown = false;
    // console.log(`touch up`);
}
function handleTouchCancel(e) {
    mouseDown = false;
    // console.log(`touch cancel`);
}
export function addIOtoCanvas(canvas) {
    canvasRect = canvas.getBoundingClientRect();
    win_x = canvas.width;
    win_y = canvas.height;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    // mobile events
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchCancel);
}
export function get_from_UI(d, u, v, simconfig) {
    if (!mouseDown)
        return;
    const i = Math.floor((mx / win_x) * simconfig.W) + 1;
    const j = Math.floor((my / win_y) * simconfig.H) + 1;
    u[ix(i, j, simconfig)] = simconfig.force * (mx - omx);
    v[ix(i, j, simconfig)] = simconfig.force * (my - omy);
    d[ix(i, j, simconfig)] = simconfig.source;
    omx = mx;
    omy = my;
}
export function get_vel_from_UI(u, v, simconfig) {
    if (!mouseDown)
        return;
    const i = Math.floor((mx / win_x) * simconfig.W) + 1;
    const j = Math.floor((my / win_y) * simconfig.H) + 1;
    u[ix(i, j, simconfig)] = simconfig.force * (mx - omx);
    v[ix(i, j, simconfig)] = simconfig.force * (my - omy);
    omx = mx;
    omy = my;
}
export function get_RGB_from_UI(r, g, b, rmult, gmult, bmult, simconfig) {
    if (!mouseDown)
        return;
    const i = Math.floor((mx / win_x) * simconfig.W) + 1;
    const j = Math.floor((my / win_y) * simconfig.H) + 1;
    r[ix(i, j, simconfig)] = simconfig.source * rmult;
    g[ix(i, j, simconfig)] = simconfig.source * gmult;
    b[ix(i, j, simconfig)] = simconfig.source * bmult;
}
