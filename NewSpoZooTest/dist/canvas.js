"use strict";
const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d", { alpha: false });
let CanvasMouseInside = false;
const CanvasMousePos = { x: 0, y: 0 };
function updateCanvasMousePos(ev) {
    const bodyRect = document.body.getBoundingClientRect();
    const canvasRect = CANVAS.getBoundingClientRect();
    const offsX = canvasRect.left - bodyRect.left;
    const offsY = canvasRect.top - bodyRect.top;
    CanvasMousePos.x = ev.pageX - offsX;
    CanvasMousePos.y = ev.pageY - offsY;
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
