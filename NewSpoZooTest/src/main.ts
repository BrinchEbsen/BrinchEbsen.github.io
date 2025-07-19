let game: SpoZoo;

const SpoZooMenuInteractFunctions
    = new Map<string, (this: GlobalEventHandlers, ev: MouseEvent) => any>;

function setupMenu(): void {
    if (!game) return;

    SpoZooMenuInteractFunctions.set("spos", (ev: MouseEvent) => {
        game.currentInteractMode = InteractMode.Spos;
    });
    SpoZooMenuInteractFunctions.set("fence", (ev: MouseEvent) => {
        game.currentInteractMode = InteractMode.Fence;
    });

    const interactMenuElements
        = document.querySelectorAll('#interactTypeButtons input[name=interactType]');

    for (let i = 0; i < interactMenuElements.length; i++) {
        const item = interactMenuElements[i] as HTMLInputElement;

        //Make the spos option selected by default
        if (item.id === "spos")
            item.checked = true;

        //Add the event handler to the radio button's onclick
        const func = SpoZooMenuInteractFunctions.get(item.id);
        if (func) item.onclick = func;
    }

    document.getElementById('widthIncrease')
        ?.addEventListener('click',(ev) => {
            game.setDimentions(
                game.sceneTileWidth + 1,
                game.sceneTileHeight
            );
    });
    document.getElementById('widthDecrease')
        ?.addEventListener('click',(ev) => {
            game.setDimentions(
                game.sceneTileWidth - 1,
                game.sceneTileHeight
            );
    });
    document.getElementById('heightIncrease')
        ?.addEventListener('click',(ev) => {
            game.setDimentions(
                game.sceneTileWidth,
                game.sceneTileHeight + 1
            );
    });
    document.getElementById('heightDecrease')
        ?.addEventListener('click',(ev) => {
            game.setDimentions(
                game.sceneTileWidth,
                game.sceneTileHeight - 1
            );
    });
}

function setupEvents(): void {
    if (!game) return;

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

function main() : void {
    game = new SpoZoo(15, 10);

    setupEvents();
    setupMenu();

    game.startDrawLoop(CANVAS, CTX);
}

preloadAllFrames().then(main);
