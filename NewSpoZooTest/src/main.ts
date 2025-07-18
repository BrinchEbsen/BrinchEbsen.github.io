let game : SpoZoo;

function setupEvents() : void {
    //MOUSE:
    document.addEventListener('mousemove', (ev) => {
        updateCanvasMousePos(ev);
    });
}

function main() : void {
    setupEvents();

    game = new SpoZoo();
    game.scene.spos.push(new Spo({x: 10, y: 10}));
    game.startDrawLoop(CANVAS, CTX);
}

preloadAllFrames().then(main);
