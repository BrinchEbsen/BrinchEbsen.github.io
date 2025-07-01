function randomFromTo(from, to) {
    let r = Math.random(); //from 0 to 1
    r *= (to - from); //from 0 to range length
    r += from; //from "from" to "to"
    return r;
}

//Create a promise that is fulfilled when all frames are loaded
//and also populate the frames array
function preloadFrames(name) {
    const promises = [];
    frames[name] = [];
    for (let i = 0; i < 12; i++) {
        const img = new Image();
        img.src = `frames/${name}/${i.toString()}.png`;
        frames[name].push(img);

        promises.push(new Promise(resolve => {
            img.onload = resolve;
        }));
    }
    return Promise.all(promises);
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

function simpleUnitVectorTo(x1, y1, x2, y2) {
    const vx = x2 - x1;
    const vy = y2 - y1;
    const ang = Math.atan2(vx, vy);
    const angAbs = Math.abs(ang);
    const angNeg = ang < 0;
    const piDiv4 = Math.PI/4;

    if (angAbs > piDiv4 * 3.5) {
        return [0, -1];
    }
    if (angAbs > piDiv4 * 2.5) {
        return angNeg ? [-1, -1] : [1, -1];
    }
    if (angAbs > piDiv4 * 1.5) {
        return angNeg ? [-1, 0] : [1, 0];
    }
    if (angAbs > piDiv4 * 0.5) {
        return angNeg ? [-1, 1] : [1, 1];
    }
    return [0, 1];
}