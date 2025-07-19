let game: SpoZoo;

function setupEvents() : void {
    if (!game) return;

    //MOUSE:
    document.addEventListener('mousedown', (ev) => {
        game.event_mousedown(CanvasMousePos);
    });
    document.addEventListener('mousemove', (ev) => {
        updateCanvasMousePos(ev);
        game.event_mousemove(CanvasMousePos);
    });
    document.addEventListener('mouseup', (ev) => {
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

function main() : void {
    game = new SpoZoo();

    setupEvents();

    game.startDrawLoop(CANVAS, CTX);
}

preloadAllFrames().then(main);
