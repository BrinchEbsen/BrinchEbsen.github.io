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

function loadData(alertBeforeOverride = true, alertIfNone = true) {
    if (!game) return;
    
    try {
        const saveStr = localStorage.getItem(SaveDataKey);
        if (saveStr != null) {
            if (alertBeforeOverride) {
                const res = confirm(
                    "Are you sure you want to override the current scene with your saved data?");
                if (!res) return;
            }

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

/**
 * Map of the interaction options and their handlers.
 */
const SpoZooMenuInteractFunctions
    = new Map<string, (this: GlobalEventHandlers, ev: MouseEvent) => any>;

/**
 * Sets up the menu events.
 */
function setupMenu(): void {
    if (!game) return;

    //Sets up the functionality of the interaction menu radio buttons.
    SpoZooMenuInteractFunctions.set("grab", (ev: MouseEvent) => {
        game.currentInteractMode = InteractMode.Grab;
    });
    SpoZooMenuInteractFunctions.set("fence", (ev: MouseEvent) => {
        game.currentInteractMode = InteractMode.Fence;
    });
    SpoZooMenuInteractFunctions.set("grass", (ev: MouseEvent) => {
        game.currentInteractMode = InteractMode.Grass;
    });

    //Assign event handlers to the radio buttons

    const interactMenuElements
        = document.querySelectorAll('#interactTypeButtons input[name=interactType]');

    for (let i = 0; i < interactMenuElements.length; i++) {
        const item = interactMenuElements[i] as HTMLInputElement;

        //Make the grab option selected by default
        if (item.id === "grab")
            item.checked = true;

        //Add the event handler to the radio button's onclick
        const func = SpoZooMenuInteractFunctions.get(item.id);
        if (func) item.onclick = func;
    }

    //Width height buttons:

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

/**
 * Sets up general event listeners for the game.
 */
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

/**
 * Starts the game
 */
function main() : void {
    game = new SpoZoo();
    game.loadSaveData(createEmptySave());

    setupEvents();
    setupMenu();

    game.startDrawLoop(CANVAS, CTX);

    //Load save if present
    loadData(false, false);
}

/**
 * Show loading text on the canvas.
 */
function setupLoadingScreen(): void {
    CANVAS.width = 300;
    CANVAS.height = 60;

    CTX.fillStyle = "black";
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

    CTX.fillStyle = "white";
    CTX.font = "30px Arial";
    CTX.fillText("Loading frames...", 10, 40);
}

/**
 * Set up the program and then run it.
 */
function init(): void {
    //Print a loading screen to the canvas while frames preload.
    setupLoadingScreen();

    //Preload all frames, then run the main program when done.
    preloadAllFrames().then(main);
}

//Start of program execution
init();