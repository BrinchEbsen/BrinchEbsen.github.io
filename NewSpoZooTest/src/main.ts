let game: SpoZoo;

const SaveDataKey = "SPOZOO_SAVEGAME";

function saveData() {
    if (!game) return;
    
    try {
        const save = game.createSaveData();

        localStorage.setItem(SaveDataKey, JSON.stringify(save));
    } catch(e) {
        console.error(e);
        if (e instanceof Error) {
            alert(e.message);
        }
    }
}

function loadData(alertIfNone = true) {
    if (!game) return;
    
    try {
        const saveStr = localStorage.getItem(SaveDataKey);
        if (saveStr != null) {
            const save = JSON.parse(saveStr) as SaveData;
            game.loadSaveData(save);
        } else if (alertIfNone) {
            alert("No save data to load!");
        }
    } catch(e) {
        console.error(e);
        if (e instanceof Error) {
            alert(e.message);
        }
    }
}

function clearData() {
    if (!game) return;
    
    if (!confirm("Are you sure you want to delete your save data?")) {
        return;
    }

    try {
        localStorage.removeItem(SaveDataKey);
        game.loadSaveData(createEmptySave());
    } catch(e) {
        console.error(e);
        if (e instanceof Error) {
            alert(e.message);
        }
    }
}

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
    SpoZooMenuInteractFunctions.set("grass", (ev: MouseEvent) => {
        game.currentInteractMode = InteractMode.Grass;
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
        ?.addEventListener('click', (ev) => {
            game.setDimensions(
                game.sceneTileWidth + 1,
                game.sceneTileHeight
            );
    });
    document.getElementById('widthDecrease')
        ?.addEventListener('click', (ev) => {
            game.setDimensions(
                game.sceneTileWidth - 1,
                game.sceneTileHeight
            );
    });
    document.getElementById('heightIncrease')
        ?.addEventListener('click', (ev) => {
            game.setDimensions(
                game.sceneTileWidth,
                game.sceneTileHeight + 1
            );
    });
    document.getElementById('heightDecrease')
        ?.addEventListener('click', (ev) => {
            game.setDimensions(
                game.sceneTileWidth,
                game.sceneTileHeight - 1
            );
    });

    document.getElementById('saveData')
        ?.addEventListener('click', (e) => { saveData(); });

    document.getElementById('loadData')
        ?.addEventListener('click', (e) => { loadData(); });

    document.getElementById('clearData')
        ?.addEventListener('click', (e) => { clearData(); });

    //Save the game before the page unloads
    window.addEventListener('beforeunload', (e) => {
        saveData();
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
    game = new SpoZoo();
    game.loadSaveData(createEmptySave());

    setupEvents();
    setupMenu();

    game.startDrawLoop(CANVAS, CTX);

    //Load save if present
    loadData(false);
}

preloadAllFrames().then(main);
