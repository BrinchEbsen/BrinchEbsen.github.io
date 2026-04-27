"use strict";
let game;
CANVAS.addEventListener('mousemove', (ev) => {
    updateCanvasMousePos(ev);
    game.event_mousemove(CanvasMousePos);
});
function main() {
    game = new SpoZoo();
    game.fitCanvas(CANVAS);
    game.startDrawLoop(CANVAS, CTX);
    for (let i = 0; i < 200; i++) {
        game.addSpo(randomFromTo(0, game.scene.width), randomFromTo(0, game.scene.height));
    }
}
function setupLoadingScreen() {
    CANVAS.width = 300;
    CANVAS.height = 60;
    CTX.fillStyle = "black";
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.fillStyle = "white";
    CTX.font = "30px Arial";
    CTX.fillText("Loading frames...", 10, 40);
}
function init() {
    const spoCountSlider = document.getElementById('spo-count-slider');
    const speedSlider = document.getElementById('speed-slider');
    const separateSlider = document.getElementById('separate-slider');
    const alignmentSlider = document.getElementById('alignment-slider');
    const cohesionSlider = document.getElementById('cohesion-slider');
    const cursorBiasSlider = document.getElementById('cursor-bias-slider');
    SpoSceneTargetCount = parseInt(spoCountSlider.value);
    SpoTargetSpeed = parseFloat(speedSlider.value);
    SpoSeparationFactor = parseFloat(separateSlider.value);
    SpoAlignmentFactor = parseFloat(alignmentSlider.value);
    SpoCohesionFactor = parseFloat(cohesionSlider.value);
    SpoCursorBiasFactor = parseFloat(cursorBiasSlider.value);
    spoCountSlider.addEventListener('input', e => {
        SpoSceneTargetCount = parseInt(e.target.value);
    });
    speedSlider.addEventListener('input', e => {
        SpoTargetSpeed = parseFloat(e.target.value);
    });
    separateSlider.addEventListener('input', e => {
        SpoSeparationFactor = parseFloat(e.target.value);
    });
    alignmentSlider.addEventListener('input', e => {
        SpoAlignmentFactor = parseFloat(e.target.value);
    });
    cohesionSlider.addEventListener('input', e => {
        SpoCohesionFactor = parseFloat(e.target.value);
    });
    cursorBiasSlider.addEventListener('input', e => {
        SpoCursorBiasFactor = parseFloat(e.target.value);
    });
    setupLoadingScreen();
    preloadAllFrames().then(main);
}
init();
