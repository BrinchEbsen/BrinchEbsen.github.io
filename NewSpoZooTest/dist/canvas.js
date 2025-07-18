"use strict";
const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");
const CanvasMousePos = { x: 0, y: 0 };
function updateCanvasMousePos(ev) {
    const rect = CANVAS.getBoundingClientRect();
    CanvasMousePos.x = ev.pageX - rect.left;
    CanvasMousePos.y = ev.pageY - rect.top;
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
