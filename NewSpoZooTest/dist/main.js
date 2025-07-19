"use strict";
let game;
const SpoZooMenuInteractFunctions = new Map;
function setupMenu() {
    var _a, _b, _c, _d;
    if (!game)
        return;
    SpoZooMenuInteractFunctions.set("spos", (ev) => {
        game.currentInteractMode = 0 /* InteractMode.Spos */;
    });
    SpoZooMenuInteractFunctions.set("fence", (ev) => {
        game.currentInteractMode = 1 /* InteractMode.Fence */;
    });
    const interactMenuElements = document.querySelectorAll('#interactTypeButtons input[name=interactType]');
    for (let i = 0; i < interactMenuElements.length; i++) {
        const item = interactMenuElements[i];
        //Make the spos option selected by default
        if (item.id === "spos")
            item.checked = true;
        //Add the event handler to the radio button's onclick
        const func = SpoZooMenuInteractFunctions.get(item.id);
        if (func)
            item.onclick = func;
    }
    (_a = document.getElementById('widthIncrease')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (ev) => {
        game.setDimentions(game.sceneTileWidth + 1, game.sceneTileHeight);
    });
    (_b = document.getElementById('widthDecrease')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', (ev) => {
        game.setDimentions(game.sceneTileWidth - 1, game.sceneTileHeight);
    });
    (_c = document.getElementById('heightIncrease')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', (ev) => {
        game.setDimentions(game.sceneTileWidth, game.sceneTileHeight + 1);
    });
    (_d = document.getElementById('heightDecrease')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', (ev) => {
        game.setDimentions(game.sceneTileWidth, game.sceneTileHeight - 1);
    });
}
function setupEvents() {
    if (!game)
        return;
    //MOUSE:
    CANVAS.addEventListener('mousedown', (ev) => {
        game.event_mousedown(CanvasMousePos);
    });
    CANVAS.addEventListener('mousemove', (ev) => {
        updateCanvasMousePos(ev);
        game.event_mousemove(CanvasMousePos);
    });
    CANVAS.addEventListener('mouseup', (ev) => {
        game.event_mouseup(CanvasMousePos);
    });
    CANVAS.addEventListener('mouseleave', (ev) => {
        game.event_mouseup(CanvasMousePos);
    });
    //KEYBOARD:
    document.addEventListener('keydown', (ev) => {
        game.event_keydown(ev);
    });
    document.addEventListener('keyup', (ev) => {
        game.event_keyup(ev);
    });
    document.addEventListener('keypress', (ev) => {
        game.event_keypress(ev);
    });
}
function main() {
    game = new SpoZoo(15, 10);
    setupEvents();
    setupMenu();
    game.startDrawLoop(CANVAS, CTX);
}
preloadAllFrames().then(main);
