let game: SpoZoo;

CANVAS.addEventListener('mousemove', (ev) => {
    updateCanvasMousePos(ev);
    game.event_mousemove(CanvasMousePos);
});

/**
 * Starts the game
 */
function main() : void {
    game = new SpoZoo();
    game.fitCanvas(CANVAS);
    game.startDrawLoop(CANVAS, CTX);

    for (let i = 0; i < 200; i++) {
        game.addSpo(
            randomFromTo(0, game.scene.width),
            randomFromTo(0, game.scene.height)
        );
    }
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
    const spoCountSlider = document.getElementById('spo-count-slider') as HTMLInputElement;
    const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
    const separateSlider = document.getElementById('separate-slider') as HTMLInputElement;
    const alignmentSlider = document.getElementById('alignment-slider') as HTMLInputElement;
    const cohesionSlider = document.getElementById('cohesion-slider') as HTMLInputElement;
    const cursorBiasSlider = document.getElementById('cursor-bias-slider') as HTMLInputElement;

    SpoSceneTargetCount = parseInt(spoCountSlider.value);
    SpoTargetSpeed = parseFloat(speedSlider.value);
    SpoSeparationFactor = parseFloat(separateSlider.value);
    SpoAlignmentFactor = parseFloat(alignmentSlider.value);
    SpoCohesionFactor = parseFloat(cohesionSlider.value);
    SpoCursorBiasFactor = parseFloat(cursorBiasSlider.value);

    spoCountSlider.addEventListener('input', e => {
        SpoSceneTargetCount = parseInt((e.target as HTMLInputElement).value);
    });
    speedSlider.addEventListener('input', e => {
        SpoTargetSpeed = parseFloat((e.target as HTMLInputElement).value);
    });
    separateSlider.addEventListener('input', e => {
        SpoSeparationFactor = parseFloat((e.target as HTMLInputElement).value);
    });
    alignmentSlider.addEventListener('input', e => {
        SpoAlignmentFactor = parseFloat((e.target as HTMLInputElement).value);
    });
    cohesionSlider.addEventListener('input', e => {
        SpoCohesionFactor = parseFloat((e.target as HTMLInputElement).value);
    });
    cursorBiasSlider.addEventListener('input', e => {
        SpoCursorBiasFactor = parseFloat((e.target as HTMLInputElement).value);
    });

    //Print a loading screen to the canvas while frames preload.
    setupLoadingScreen();

    //Preload all frames, then run the main program when done.
    preloadAllFrames().then(main);
}

//Start of program execution
init();