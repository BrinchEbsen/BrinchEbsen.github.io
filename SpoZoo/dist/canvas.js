"use strict";
const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d", { alpha: false });
let CanvasMouseInside = false;
const CanvasMousePos = { x: 0, y: 0 };
function updateCanvasMousePos(ev) {
    const canvasRect = CANVAS.getBoundingClientRect();
    CanvasMousePos.x = ev.clientX - canvasRect.left;
    CanvasMousePos.y = ev.clientY - canvasRect.top;
    CanvasMouseInside = ((CanvasMousePos.x >= 0) && (CanvasMousePos.x <= CANVAS.width) &&
        (CanvasMousePos.y >= 0) && (CanvasMousePos.y <= CANVAS.height));
}
function setEnableScroll(enable) {
    const scrollDisabled = document.body.classList.contains("disableScroll");
    if (!enable && !scrollDisabled) {
        document.body.classList.add("disableScroll");
    }
    else if (enable && scrollDisabled) {
        document.body.classList.remove("disableScroll");
    }
}
