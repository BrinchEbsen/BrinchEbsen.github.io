"use strict";
let game;
function setupEvents() {
    //MOUSE:
    document.addEventListener('mousemove', (ev) => {
        updateCanvasMousePos(ev);
    });
}
function main() {
    setupEvents();
    game = new SpoZoo();
    game.scene.spos.push(new Spo({ x: 10, y: 10 }));
    game.startDrawLoop(CANVAS, CTX);
}
preloadAllFrames().then(main);
