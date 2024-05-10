import { ix } from "./utils.js";
let omx;
let omy;
let mx;
let my;
let mouseLeftDown = false;
let mouseRightDown = false;
let canvasRect;
let win_x;
let win_y;
function updateCanvasRect(canvas) {
    canvasRect = canvas.getBoundingClientRect();
}
function handleMouseDown(e) {
    updateCanvasRect(e.target);
    if (e.button != 0 && e.button != 2)
        return;
    mouseLeftDown = e.button == 0;
    mouseRightDown = e.button == 2;
    mx = e.clientX - canvasRect.left;
    omx = mx;
    my = e.clientY - canvasRect.top;
    omy = my;
    // console.log(`mouse ${e.button} down at (${mx}, ${my})`);
}
function handleMouseMove(e) {
    if (!mouseLeftDown && !mouseRightDown)
        return;
    mx = e.clientX - canvasRect.left;
    my = e.clientY - canvasRect.top;
    // console.log(`mouse ${e.button} move at (${mx}, ${my})`);
}
function handleMouseUp(e) {
    if (!mouseLeftDown && !mouseRightDown)
        return;
    mouseLeftDown = false;
    mouseRightDown = false;
    // console.log(`mouse ${e.button} up`);
}
export function addIOtoCanvas(canvas) {
    canvasRect = canvas.getBoundingClientRect();
    win_x = canvas.width;
    win_y = canvas.height;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });
}
export function get_from_UI(d, u, v, simconfig) {
    if (!mouseLeftDown && !mouseRightDown)
        return;
    const i = Math.floor((mx / win_x) * simconfig.W) + 1;
    const j = Math.floor((my / win_y) * simconfig.H) + 1;
    if (mouseLeftDown) {
        u[ix(i, j, simconfig)] = simconfig.force * (mx - omx);
        v[ix(i, j, simconfig)] = simconfig.force * (my - omy);
    }
    if (mouseRightDown) {
        d[ix(i, j, simconfig)] = simconfig.source;
    }
    omx = mx;
    omy = my;
}
export function get_vel_from_UI(u, v, simconfig) {
    if (!mouseLeftDown)
        return;
    const i = Math.floor((mx / win_x) * simconfig.W) + 1;
    const j = Math.floor((my / win_y) * simconfig.H) + 1;
    if (mouseLeftDown) {
        u[ix(i, j, simconfig)] = simconfig.force * (mx - omx);
        v[ix(i, j, simconfig)] = simconfig.force * (my - omy);
    }
    omx = mx;
    omy = my;
}
export function get_RGB_from_UI(r, g, b, rmult, gmult, bmult, simconfig) {
    if (!mouseRightDown)
        return;
    const i = Math.floor((mx / win_x) * simconfig.W) + 1;
    const j = Math.floor((my / win_y) * simconfig.H) + 1;
    r[ix(i, j, simconfig)] = simconfig.source * rmult;
    g[ix(i, j, simconfig)] = simconfig.source * gmult;
    b[ix(i, j, simconfig)] = simconfig.source * bmult;
}
