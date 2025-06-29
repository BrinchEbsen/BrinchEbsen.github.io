const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const rainbowCheckbox = document.getElementById("rainbow");

const resolutionButtons = document.querySelectorAll('[name="resolution"]');

resolutionButtons.forEach(btn => {
    btn.addEventListener("input", (e) => {
        const tgt = e.target;

        const sizes = tgt.getAttribute("value").split("x");

        canvas.width = sizes[0];
        canvas.height = sizes[1];

        console.log(sizes);
    });
});

resolutionButtons[0].checked = true;

//Counter

let counter = 0;

const counterLabel = document.getElementById("counter");

function updateCounterLabel() {
    counterLabel.textContent = counter.toFixed(2);
}

const counterReset = document.getElementById("resetCounter");
counterReset.addEventListener("click", (e) => {
    counter = 0;
    counterLabel.textContent = "0";
});

//Speed

let speed = 1.0;

const speedLabel = document.getElementById("speedLabel");
const speedInput = document.getElementById("speed");

function setSpeedLabel(val) {
    speedLabel.textContent = `${val}x`;
}

speedInput.value = speed;
setSpeedLabel(speedInput.value);

speedInput.addEventListener("input", (e) => {
    setSpeedLabel(e.target.value);
    speed = Number(e.target.value);
});

const speedReset = document.getElementById("resetSpeed");
speedReset.addEventListener("click", (e) => {
    speed = 1.0;
    speedInput.value = speed;
    setSpeedLabel(speed);
});

//Seed

let startSeed = 0;

const startSeedInput = document.getElementById("startSeed");
startSeedInput.value = startSeed;

startSeedInput.addEventListener("input", (e) => {
    startSeed = e.target.value;
});

const seedReset = document.getElementById("resetSeed");
seedReset.addEventListener("click", (e) => {
    startSeed = 0;
    startSeedInput.value = startSeed;
});

//Number of sectors

let numSectors = 30;

const numSectorsInput = document.getElementById("numSectors");
numSectorsInput.value = numSectors;

numSectorsInput.addEventListener("input", (e) => {
    numSectors = e.target.value;
});

const numSectorsReset = document.getElementById("resetNumSectors");
numSectorsReset.addEventListener("click", (e) => {
    numSectors = 30;
    numSectorsInput.value = numSectors;
});

//Color

const colorInput = document.getElementById("color");
const colorReset = document.getElementById("resetColor");

let sectorColor;

function resetSectorColor() {
    sectorColor = "#008000";
    colorInput.value = sectorColor;
}

resetSectorColor();

colorInput.addEventListener("change", (e) => {
    sectorColor = e.target.value;
});

colorReset.addEventListener("click", (e) => {
    resetSectorColor();
});

//Params

let params = [
    { default: 10, min: -50, max: 50 },
    { default: 400, min: 0, max: 2000 },
    { default: 80, min: 0, max: 500 },
    { default: 50, min: 0, max: 500 },
    { default: 8, min: 0, max: 20 },
    { default: 20, min: 0, max: 200 },
    { default: 10, min: 0, max: 200 },
    { default: 80, min: 0, max: 200 },
    { default: 16, min: 0, max: 200 },
    { default: 128, min: 80, max: 1000 },
    { default: 0.85, min: 0, max: 1, step: 0.01 }
];

function initParams() {
    params.forEach(param => {
        param.val = param.default;
    });
}

initParams();

const paramsDiv = document.getElementById("params");

//Create controls for each parameter
for(let i = 0; i < params.length; i++) {
    //Create the input range element
    const inputElem = document.createElement("input");
    inputElem.setAttribute("type", "range");
    inputElem.setAttribute("min", params[i].min.toString());
    inputElem.setAttribute("max", params[i].max.toString());
    let step = params[i].step == null ? "0.1" : params[i].step;
    inputElem.setAttribute("step", step);
    inputElem.setAttribute("value", params[i].val.toString());

    //Create label element showing the value
    const labelElem = document.createElement("label");
    labelElem.textContent = params[i].val.toString();

    //Create set method for parameter
    params[i].set = (v) => {
        params[i].val = v;
        inputElem.value = v;
        labelElem.textContent = v.toString();
    }

    //Make input element change value
    inputElem.addEventListener("input", (e) => {
        params[i].val = Number(e.target.value);
        labelElem.textContent = params[i].val.toString();
    });

    //Create reset button
    const buttonElem = document.createElement("button");
    buttonElem.textContent = "Reset";
    buttonElem.addEventListener("click", (e) => {
        params[i].set(params[i].default);
    });

    //Add elements to the div
    paramsDiv.appendChild(buttonElem);
    paramsDiv.appendChild(inputElem);
    paramsDiv.appendChild(labelElem);
    paramsDiv.appendChild(document.createElement("br"));

    //Add randomize method to parameter
    params[i].randomize = () => {
        let val = (Math.random() * (params[i].max - params[i].min)) + params[i].min;
        params[i].set(val);
    }

    //Add reset method to parameter
    params[i].reset = () => {
        params[i].set(params[i].default);
    }
}

//"Randomize All" button
const randomzeParamsBtn = document.getElementById("randomizeParams");
randomzeParamsBtn.addEventListener("click", (e) => {
    params.forEach(param => {
        param.randomize();
    });
});

//"Reset All" button
const resetParamsBtn = document.getElementById("resetParams");
resetParamsBtn.addEventListener("click", (e) => {
    params.forEach(param => {
        param.reset();
    });
});



//---------------------------------------------------------



//Converts hex string into IEEE754 float
//https://gist.github.com/laerciobernardo/498f7ba1c269208799498ea8805d8c30
function parseFloat(str) {
  var float = 0, sign, order, mantiss,exp,
      int = 0, multi = 1;
  if (/^0x/.exec(str)) {
    int = parseInt(str,16);
  }else{
    for (var i = str.length -1; i >=0; i -= 1) {
      if (str.charCodeAt(i)>255) {
        console.log('Wrong string parametr'); 
        return false;
      }
      int += str.charCodeAt(i) * multi;
      multi *= 256;
    }
  }
  sign = (int>>>31)?-1:1;
  exp = (int >>> 23 & 0xff) - 127;
  mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
  for (i=0; i<mantissa.length; i+=1){
    float += parseInt(mantissa[i])? Math.pow(2,exp):0;
    exp--;
  }
  return float*sign;
}

// Re-implementation of EXRandClass in EngineX
let randSeed = 0;
const C1 = 0x343FD;
const C2 = 0x269EC3;
const C3 = parseFloat("0x30000000");
function Rand32() {
    const n = (randSeed * C1 + C2) >>> 0;
    randSeed = (n * C1 + C2) >>> 0;

    const upper = (n & 0xFFFF0000) >>> 0;
    const lower = ((randSeed >> 16) & 0xFFFF) >>> 0;

    return (upper | lower) >>> 0;
}
function RandF() {
    let n = Rand32() >>> 0;

    n = (n >> 1) >>> 0;

    return (n * C3) % 1.0;
}

/**
 * Draw a semicircular sector to the canvas.
 * 
 * r1, r2 and r3 are the tree radii for the sector.
 * The sector is drawn from r1 (inner) to r3 (outer), with r2 in the middle,
 * and the bit between r1 and r2 is drawn with a gradient.
 * 
 * The start and end angles are in radians.
 */
function drawSector(r1, r2, r3, angStart, angEnd, color) {
    //Get the middle point of the canvas.
    const middle = [
        ctx.canvas.width/2,
        ctx.canvas.height/2
    ];

    //validation
    if (r3 < 0) return;

    if (r1 < 0) r1 = 0;
    if (r2 < 0) r2 = 0;

    if (r2 > r3) r2 = r3;
    if (r1 > r2) r1 = r2;

    //Create a gradient that starts from the middle and to the outer radius.
    const gradient = ctx.createRadialGradient(middle[0], middle[1], 0, middle[0], middle[1], r3);

    //Get the ratios of the inner and middle radii.
    const angRatio1 = r1/r3;
    const angRatio2 = r2/r3;

    //Create the color stops
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(angRatio1, "transparent");
    gradient.addColorStop(angRatio2, color);
    gradient.addColorStop(1, color);

    //Fill out an arc with the gradient

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(middle[0], middle[1]); //Move to center
    ctx.arc(middle[0], middle[1], r3, angStart, angEnd);
    ctx.lineTo(middle[0], middle[1]); //Move to center again to end shape
    ctx.closePath();

    ctx.fill();
}

//Fill background with black
function clearBackground() {
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "black";
    ctx.fill();
}

//Draw the state of the loading screen to the canvas with the current state.
//Almost 1-to-1 to the actual in-game code.
function drawFrame() {
    clearBackground();

    //Reset the RNG seed
    randSeed = startSeed;

    //The counter but 1000 times smaller
    const timeLine = counter * 0.001;
    //Value that cycles between 0 and 1 every 1000 frames
    const timeCycle = timeLine % 1.0;

    //Draw all sectors
    for (let i = 0; i < numSectors; i++) {
        //scratch variables
        let n1 = 0;
        let n2 = 0;

        //Current point in the sector's life cycle.
        //Cycles at the same rate as timeCycle, just offset slightly.
        n1 = RandF(); //Range: 0 to 1
        const lifeCycle = (timeCycle + n1) % 1.0;
        //console.log("lifeCycle: "+lifeCycle);

        //radii

        n1 = RandF() * 4.0 + params[0].val; //Range: 10 to 14
        n2 = n1 - (lifeCycle * params[0].val);
        let radius2 = params[1].val / n2; //Radius dividing the two sectors

        n1 = RandF() * params[2].val + params[3].val; //Range: 50 to 130
        let radius3 = radius2 + (n1 / n2); //Outer radius
        
        let radius1 = radius2 - (n1 * (1.0/params[4].val)); //Inner radius

        //Start angle
        n1 = RandF() * Math.PI * 2; //Range: 0 to 2*PI
        n2 = RandF(); //Range: 0 to 1
        const startAng = timeLine * (n2 * params[5].val - params[6].val) + n1;

        //End angle
        n1 = RandF() * params[7].val + params[8].val; //Range: 16 to 96
        const endAng = n1 * 0.017453292 + startAng;

        //Calculate colors.
        //Original game code uses alpha 0-128.
        //We convert that to 0 to 1 afterwards.

        let alpha = lifeCycle * 1000.0;

        if (alpha > params[9].val) alpha = params[9].val;

        if (lifeCycle > params[10].val) {
            alpha = alpha * ((1.0 - lifeCycle) * (2.0/3.0) * 10.0);
        }

        if (alpha < 0) alpha = 0;
        if (alpha > 80.0) alpha = 80.0;

        //Convert to ratio
        alpha = (alpha / 80.0);

        //Convert to alpha, 0 to FF
        alpha = Math.floor(alpha * 0xFF);
        alpha = alpha.toString(16);

        //Pad length to 2 characters
        if (alpha.length < 2) alpha = "0"+alpha;

        let color;
        if (rainbowCheckbox.checked) {
            //Store the random seed so it doesn't affect later drawn sectors
            let tempSeed = randSeed;
            let r = Rand32() % 0xFF;
            let g = Rand32() % 0xFF;
            let b = Rand32() % 0xFF;
            randSeed = tempSeed;
            if (r < 0x10) r = 0x10;
            if (g < 0x10) g = 0x10;
            if (b < 0x10) b = 0x10;
            color = "#" + r.toString(16) + g.toString(16) + b.toString(16);
        } else {
            color = sectorColor;
        }
        color += alpha;

        drawSector(radius1, radius2, radius3, startAng, endAng, color);
    }
}

function testRandF() {
    const num = 1000;
    let total = 0;
    let min = 100;
    let max = 0;
    for (let i = 0; i < num; i++) {
        const n = RandF();
        total += n;
        if (n < min) min = n;
        if (n > max) max = n;
    }
    console.log("RandF average: "+(total / num));
    console.log("RandF min: "+min);
    console.log("RandF max: "+max);
}

function startInterval() {
    setInterval(() => {
        counter += speed;
        updateCounterLabel();
        drawFrame();
    }, 1000/60);
}

function main() {
    startInterval();

    //testRandF();
}

main();