const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const frameSize = 128;
const spoBoundsBox = {
    x: 32,
    y: 32,
    w: 64,
    h: 64
};

const animNames = [
    {name: "stand_up", rate: 0.25},
    {name: "stand_upright", rate: 0.25},
    {name: "stand_right", rate: 0.25},
    {name: "stand_downright", rate: 0.25},
    {name: "stand_down", rate: 0.25},
    {name: "stand_downleft", rate: 0.25},
    {name: "stand_left", rate: 0.25},
    {name: "stand_upleft", rate: 0.25},
    {name: "walk_up", rate: 0.5},
    {name: "walk_upright", rate: 0.5},
    {name: "walk_right", rate: 0.5},
    {name: "walk_downright", rate: 0.5},
    {name: "walk_down", rate: 0.5},
    {name: "walk_downleft", rate: 0.5},
    {name: "walk_left", rate: 0.5},
    {name: "walk_upleft", rate: 0.5}
];

//Animation frames
let frames = {};

//Show debug text on the canvas
let DEBUG = false;

//The amount of spo per pixel to aim for
const spoDensityTarget = 1;
//The max amount of spos
const spoLimit = 1000;
//the array of spos
const spos = [];

//Used to make mouse hidden if left idle for a while
let mouseIdleTimer = 120;

document.addEventListener('mousemove', () => {
    mouseIdleTimer = 120;
});
document.addEventListener('keypress', (ev) => {
    if (ev.code == "KeyD") {
        DEBUG = !DEBUG;
    }
});
canvas.addEventListener('click', (ev) => {
    scatterSpos(ev.pageX, ev.pageY);
});

function handleMouse() {
    const isHidden = document.body.classList.contains("mouseHidden");

    mouseIdleTimer--;
    if (mouseIdleTimer < 0) {
        mouseIdleTimer = 0;
        if (!isHidden) {
            document.body.classList.add("mouseHidden");
        }
    } else if (isHidden) {
        document.body.classList.remove("mouseHidden");
    }
}

function scatterSpos(x, y) {
    spos.forEach(spo => {
        spo.scatterFrom(x, y);
    });
}

//The ratio of spo pixels compared to non-spo pixels
function currentSpoDensity() {
    if (spos.length == 0) return 0;

    const spoPixels = (spoBoundsBox.w * spoBoundsBox.h) * spos.length;
    const canvasPixels = canvas.width * canvas.height;

    return spoPixels / canvasPixels;
}

//The number of spos to add/remove to meet the density target
function sposTargetDeviation() {
    const oneSpo = spoBoundsBox.w * spoBoundsBox.h;
    const spoPixels = oneSpo * spos.length;
    const canvasPixels = canvas.width * canvas.height;

    const targetPixels = Math.floor(spoDensityTarget * canvasPixels);
    const pixelsDeviation = targetPixels - spoPixels;

    return Math.floor(pixelsDeviation / oneSpo);
}

function fitCanvasToWindow() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

//Sort the spos according to their y-position in the scene
function sortSpos() {
    spos.sort((s1, s2) => {
        if (s1.y > s2.y) return 1;
        else return -1;
    });
}

function addNewSpo() {
    const addSpo = new Spo(0, 0);
    addSpo.randomStartPosition();
    spos.push(addSpo);
}

function removeRandomSpo() {
    const index = Math.floor(randomFromTo(0, spos.length));

    spos.splice(index, 1);
}

function drawFrame() {
    fitCanvasToWindow();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    spos.forEach(spo => {
        spo.move();
    });

    sortSpos();
    spos.forEach(spo => {
        spo.draw();
    });

    if (DEBUG) {
        ctx.fillStyle = "white";
        ctx.fillText(`Num: ${spos.length}, Density: ${currentSpoDensity()}, Deviation: ${sposTargetDeviation()}`, 10, 10);
    }
}

//Add a new spo if we're below target
function checkAddSpo() {
    if (spos.length > spoLimit) {
        removeRandomSpo();
        return;
    }

    const deviation = sposTargetDeviation();

    if (deviation > 0 && spos.length < spoLimit) {
        addNewSpo();
    } else if (deviation < 0) {
        removeRandomSpo();
    }
}

//Add spos randomly on the screen to meet the target
function sprinkleSpos() {
    const deviation = sposTargetDeviation();

    if (deviation <= 0) return;

    for (let i = 0; i < Math.min(deviation, spoLimit-1); i++) {
        addNewSpo();
    }
}

function main() {
    fitCanvasToWindow();

    addNewSpo();

    sprinkleSpos();

    //Main frame interval
    setInterval(() => {
        handleMouse();
        drawFrame();
    }, 1000/60);

    //Occasional spo addition interval
    setInterval(() => {
        checkAddSpo();
    }, 10);
}

function init() {
    fitCanvasToWindow();
    ctx.fillStyle = "white";
    ctx.fillText("Loading images...", 10, 10);

    const promises = [];

    for (let i = 0; i < animNames.length; i++) {
        promises.push(preloadFrames(animNames[i].name));
    }
    
    Promise.all(promises).then(() => {
        main();
    });
}

init();