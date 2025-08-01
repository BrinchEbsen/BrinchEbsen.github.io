const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//Animation frames
let frames = [];

//Show debug text on the canvas
let DEBUG = false;

//The speed the spos travel at
let spoSpeed = 5;
//The speed the spos animate at
let spoAnimSpeed = 1;
//The amount of spo per pixel to aim for
const spoDensityTarget = 1;
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

//The ratio of spo pixels compared to non-spo pixels
function currentSpoDensity() {
    if (spos.length == 0) return 0;

    const spoPixels = (frames[0].width * frames[0].height) * spos.length;
    const canvasPixels = canvas.width * canvas.height;

    return spoPixels / canvasPixels;
}

//The number of spos to add/remove to meet the density target
function sposTargetDeviation() {
    const oneSpo = frames[0].width * frames[0].height;
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

//Sort the spos according to their "depth" in the scene
function sortSpos() {
    //Using cross-product to determine difference in depth
    spos.sort((s1, s2) => {
        //Vector is down-right so always 1, 1
        const dx = s2.x - s1.x;
        const dy = s2.y - s1.y;
        const cross = (dx - dy);
        
        if (cross < 0) return -1;
        if (cross > 0) return 1;
        return 0;
    });
}

function addNewSpo() {
    const addSpo = new Spo(0, 0, frames);
    addSpo.pickNewStartPosition();
    spos.push(addSpo);
}

function drawFrame() {
    fitCanvasToWindow();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < spos.length; i++) {
        const spo = spos[i];

        spo.move();

        if (spo.offScreen) {
            const deviation = sposTargetDeviation();

            if (deviation > 0) {
                spo.pickNewStartPosition();
                addNewSpo();
            } else if (deviation < 0) {
                spos.splice(i, 1);
            } else {
                spo.pickNewStartPosition();
            }
        }
    }

    sortSpos();
    spos.forEach(spo => {
        spo.draw(ctx);
    });

    if (DEBUG) {
        ctx.fillStyle = "white";
        ctx.fillText(`Density: ${currentSpoDensity()}, Deviation: ${sposTargetDeviation()}`, 10, 10);
    }
}

//Add a new spo if we're below target
function checkAddSpo() {
    const deviation = sposTargetDeviation();

    if (deviation > 0) {
        addNewSpo();
    }
}

//Add spos randomly on the screen to meet the target
function sprinkleSpos() {
    const deviation = sposTargetDeviation();

    if (deviation <= 0) return;

    for (let i = 0; i < deviation; i++) {
        const x = randomFromTo(-frames[0].width, canvas.width);
        const y = randomFromTo(-frames[0].height, canvas.height);
        spos.push(new Spo(x, y, frames));
    }
}

function main() {
    fitCanvasToWindow();

    sprinkleSpos();

    //Main frame interval
    setInterval(() => {
        handleMouse();
        drawFrame();
    }, 1000/60);

    //Occasional spo addition interval
    setInterval(() => {
        checkAddSpo();
    }, 100);
}

function init() {
    //Wait for frames to load before running code
    const framesObj = {frames: frames};
    const promise = preloadFrames(framesObj, "frames/spo_");
    frames = framesObj.frames;
    promise.then(() => {
        main();
    });
}

init();