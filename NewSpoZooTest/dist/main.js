"use strict";
let game;
const SaveDataKey = "SPOZOO_SAVEGAME";
function saveData() {
    if (!game)
        return;
    try {
        const save = game.createSaveData();
        localStorage.setItem(SaveDataKey, JSON.stringify(save));
    }
    catch (e) {
        console.error(e);
        if (e instanceof Error) {
            alert(e.message);
        }
    }
}
function loadData(alertIfNone = true) {
    if (!game)
        return;
    try {
        const saveStr = localStorage.getItem(SaveDataKey);
        if (saveStr != null) {
            const save = JSON.parse(saveStr);
            game.loadSaveData(save);
        }
        else if (alertIfNone) {
            alert("No save data to load!");
        }
    }
    catch (e) {
        console.error(e);
        if (e instanceof Error) {
            alert(e.message);
        }
    }
}
function clearData() {
    if (!game)
        return;
    if (!confirm("Are you sure you want to delete your save data?")) {
        return;
    }
    try {
        localStorage.removeItem(SaveDataKey);
        game.loadSaveData(createEmptySave());
    }
    catch (e) {
        console.error(e);
        if (e instanceof Error) {
            alert(e.message);
        }
    }
}
const SpoZooMenuInteractFunctions = new Map;
function setupMenu() {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!game)
        return;
    SpoZooMenuInteractFunctions.set("spos", (ev) => {
        game.currentInteractMode = 0;
    });
    SpoZooMenuInteractFunctions.set("fence", (ev) => {
        game.currentInteractMode = 1;
    });
    SpoZooMenuInteractFunctions.set("grass", (ev) => {
        game.currentInteractMode = 2;
    });
    const interactMenuElements = document.querySelectorAll('#interactTypeButtons input[name=interactType]');
    for (let i = 0; i < interactMenuElements.length; i++) {
        const item = interactMenuElements[i];
        if (item.id === "spos")
            item.checked = true;
        const func = SpoZooMenuInteractFunctions.get(item.id);
        if (func)
            item.onclick = func;
    }
    (_a = document.getElementById('widthIncrease')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (ev) => {
        game.setDimensions(game.sceneTileWidth + 1, game.sceneTileHeight);
    });
    (_b = document.getElementById('widthDecrease')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', (ev) => {
        game.setDimensions(game.sceneTileWidth - 1, game.sceneTileHeight);
    });
    (_c = document.getElementById('heightIncrease')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', (ev) => {
        game.setDimensions(game.sceneTileWidth, game.sceneTileHeight + 1);
    });
    (_d = document.getElementById('heightDecrease')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', (ev) => {
        game.setDimensions(game.sceneTileWidth, game.sceneTileHeight - 1);
    });
    (_e = document.getElementById('saveData')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', (e) => { saveData(); });
    (_f = document.getElementById('loadData')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', (e) => { loadData(); });
    (_g = document.getElementById('clearData')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', (e) => { clearData(); });
    window.addEventListener('beforeunload', (e) => {
        saveData();
    });
}
function setupEvents() {
    if (!game)
        return;
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
    game = new SpoZoo();
    game.loadSaveData(createEmptySave());
    setupEvents();
    setupMenu();
    game.startDrawLoop(CANVAS, CTX);
    loadData(false);
}
preloadAllFrames().then(main);
