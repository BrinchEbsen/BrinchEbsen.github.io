const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });

const fps = 60.0;
const frameInterval = 1000.0 / fps;
let currMS = window.performance.now();
let lastMS = currMS;

let beforeDrawMS = 0;
let afterDrawMS = 0;
let drawMSDiff = 0;

const frameSize = 128;
const spoBoundsBox = {
    x: 32,
    y: 32,
    w: 64,
    h: 64
};

const fenceTileSize = 64;
const fenceFrames = {};

const fenceFrameNames = [
    "fence_",
    "fence_U",
    "fence_UR",
    "fence_URD",
    "fence_URDL",
    "fence_URL",
    "fence_UD",
    "fence_UDL",
    "fence_UL",
    "fence_R",
    "fence_RD",
    "fence_RDL",
    "fence_RL",
    "fence_D",
    "fence_DL",
    "fence_L"
];

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

const goldenChance = 1.0/2000.0;

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

const fences = [];

//Used to make mouse hidden if left idle for a while
let mouseIdleTimer = 120;

document.addEventListener('mousemove', (ev) => {
    mouseIdleTimer = 120;
    makeSposCurious(ev.pageX, ev.pageY);
    spos.forEach(spo => {
        spo.mouseMoved(ev.pageX, ev.pageY);
    });
});
canvas.addEventListener('mouseleave', () => {
    spos.forEach(spo => {
        spo.mouseLeave();
    });
});
canvas.addEventListener('mousedown', (ev) => {
    //Interrupt easter egg on mouse click because it scatters the spos
    waitForEasterEgg = false;
    
    let oneIsGrabbed = false;
    spos.forEach(spo => {
        if (!oneIsGrabbed) {
            spo.mouseDown(ev.pageX, ev.pageY);
            if (spo.state == "grabbed") oneIsGrabbed = true;
        }
        spo.scatterFrom(ev.pageX, ev.pageY);
    });
});
canvas.addEventListener('mouseup', () => {
    spos.forEach(spo => {
        spo.mouseUp();
    });
});
document.addEventListener('keypress', (ev) => {
    handleEasterEggInput(ev.code);

    if (ev.code == "KeyD") {
        DEBUG = !DEBUG;
    }
});

let easterEggProgress = 0;
const easterEggKeys = ["KeyS", "KeyP", "KeyO"];

const letterS = [30, 30];
const letterP = [letterS[0]+100, letterS[1]];
const letterO = [letterS[0]+200, letterS[1]];

const spoEasterEgg = [
    [letterS[0]     , letterS[1]],
    [letterS[0] + 20, letterS[1]],
    [letterS[0] + 40, letterS[1]],
    [letterS[0]     , letterS[1] + 20],
    [letterS[0]     , letterS[1] + 40],
    [letterS[0] + 20, letterS[1] + 40],
    [letterS[0] + 40, letterS[1] + 40],
    [letterS[0] + 40, letterS[1] + 60],
    [letterS[0]     , letterS[1] + 80],
    [letterS[0] + 20, letterS[1] + 80],
    [letterS[0] + 40, letterS[1] + 80],

    [letterP[0]     , letterP[1]],
    [letterP[0] + 20, letterP[1]],
    [letterP[0] + 40, letterP[1]],
    [letterP[0]     , letterP[1] + 20],
    [letterP[0] + 40, letterP[1] + 20],
    [letterP[0]     , letterP[1] + 40],
    [letterP[0] + 20, letterP[1] + 40],
    [letterP[0] + 40, letterP[1] + 40],
    [letterP[0]     , letterP[1] + 60],
    [letterP[0]     , letterP[1] + 80],

    [letterO[0]     , letterO[1]],
    [letterO[0] + 20, letterO[1]],
    [letterO[0] + 40, letterO[1]],
    [letterO[0]     , letterO[1] + 20],
    [letterO[0] + 40, letterO[1] + 20],
    [letterO[0]     , letterO[1] + 40],
    [letterO[0] + 40, letterO[1] + 40],
    [letterO[0]     , letterO[1] + 60],
    [letterO[0] + 40, letterO[1] + 60],
    [letterO[0]     , letterO[1] + 80],
    [letterO[0] + 20, letterO[1] + 80],
    [letterO[0] + 40, letterO[1] + 80],
];

let waitForEasterEgg = false;

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

function makeSposCurious(x, y) {
    spos.forEach(spo => {
        spo.lookAtIfStanding(x, y);
    });
}

function handleEasterEggInput(keyCode) {
    if (!easterEggKeys.includes(keyCode)) {
        easterEggProgress = 0;
        return;
    }

    if (easterEggKeys[easterEggProgress] == keyCode) {
        easterEggProgress++;
    }

    if (easterEggProgress >= easterEggKeys.length) {
        easterEggProgress = 0;
        formSpoWord();
    }
}

function formSpoWord() {
    if (waitForEasterEgg) return;

    //Keep track of this separately, so we can skip over spos if needed
    let eeIndex = 0;

    waitForEasterEgg = true;
    for (let i = 0; i < spos.length && eeIndex < spoEasterEgg.length; i++) {
        const spo = spos[i];
        if (spo.state == "grabbed") continue;

        spo.walkTo(spoEasterEgg[eeIndex][0], spoEasterEgg[eeIndex][1], [0, 1]);
        eeIndex++;
    }
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

function sortByY(array) {
    return array.sort((a, b) => {
        if (a.y + a.center.y > b.y + b.center.y) return 1;
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
    
    //Ignore spos that are grabbed (better UX)
    if (spos[index].state == "grabbed") return;

    spos.splice(index, 1);
}

function handleEasterEgg() {
    if (waitForEasterEgg) {
        let stillWalking = false;
        let noProgress = true; //Whether there are no spos left to do the formation
        for (let i = 0; i < spos.length; i++) {
            const spo = spos[i];
            //Check if any are still walking to the point
            if (spo.state == "walktopoint") {
                stillWalking = true;
            }
            //If any are in either of these states, the easter egg is still forming
            if (spo.state == "walktopoint" || spo.state == "standstill") {
                noProgress = false;
            }
        }

        //If nobody is doing the formation, just cancel the easter egg
        if (noProgress) {
            waitForEasterEgg = false;
            return;
        }

        //If we're not still forming, make 'em all spin.
        if (!stillWalking) {
            waitForEasterEgg = false;
            for (let i = 0; i < spos.length; i++) {
                const spo = spos[i];
                if (spo.state == "standstill") {
                    spo.makeSpin(240);
                }
            }
        }
    }
}

function drawFrame() {
    fitCanvasToWindow();

    handleEasterEgg();

    //TODO: Make it only update when a fence is placed/removed
    fences.forEach(fence => {
        fence.updateNeighbors();
    });

    spos.forEach(spo => {
        spo.move();
        fences.forEach(fence => {
            const status = fence.checkCollide(spo.centerX, spo.centerY);
            if (status.hit) {
                spo.centerX = status.x;
                spo.centerY = status.y;
            }
        });
    });

    let sprites = [];
    sprites = sprites.concat(spos, fences);
    sortByY(sprites);

    sprites.forEach(sprite => {
        sprite.draw();
    });

    if (DEBUG) {
        ctx.fillStyle = "white";
        ctx.fillText(`Num: ${spos.length}, Density: ${currentSpoDensity()}, Deviation: ${sposTargetDeviation()}`, 10, 10);
        ctx.fillText(`Waiting for "SPO": ${waitForEasterEgg}`, 10, 30);
        ctx.fillText(`Draw time (ms) ${drawMSDiff}`, 10, 40);
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

function drawLoop() {
    currMS = window.performance.now();

    if (currMS - lastMS > frameInterval) {
        lastMS = currMS;
        handleMouse();
        
        beforeDrawMS = window.performance.now();
        drawFrame();
        afterDrawMS = window.performance.now();
        drawMSDiff = afterDrawMS - beforeDrawMS;
    }
    
    window.requestAnimationFrame(drawLoop);
}

function main() {
    fitCanvasToWindow();

    addNewSpo();

    sprinkleSpos();

    //fences.push(new Fence(2, 2));
    //fences.push(new Fence(3, 2));
    //fences.push(new Fence(3, 3));
    //fences.push(new Fence(10, 3));
    //fences.push(new Fence(2, 5));
    //fences.push(new Fence(3, 5));
    //fences.push(new Fence(4, 5));
    //fences.push(new Fence(2, 6));
    //fences.push(new Fence(4, 6));
    //fences.push(new Fence(2, 7));
    //fences.push(new Fence(3, 7));
    //fences.push(new Fence(4, 7));

    //Main frame interval
    drawLoop();
    
    //Occasional spo addition interval
    setInterval(() => {
        checkAddSpo();
    }, 10);
}

function preloadFenceFrames() {
    const promises = [];

    for(let i = 0; i < fenceFrameNames.length; i++) {
        let frame = new Image();
        frame.src = `frames/fence/${fenceFrameNames[i]}.png`;
        fenceFrames[fenceFrameNames[i]] = frame;

        promises.push(new Promise(resolve => {
            frame.onload = resolve;
        }));
    }

    return Promise.all(promises);
}

function init() {
    fitCanvasToWindow();
    ctx.fillStyle = "white";
    ctx.fillText("Loading images...", 10, 10);

    let promises = [];

    for (let i = 0; i < animNames.length; i++) {
        promises.push(preloadFrames(animNames[i].name));
    }
    promises = promises.concat(preloadFenceFrames());

    Promise.all(promises).then(() => {
        main();
    });
}

init();