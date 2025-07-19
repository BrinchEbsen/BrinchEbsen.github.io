type Vec = { x: number, y: number };

function vecCopy(vec: Vec): Vec {
    return {
        x: vec.x,
        y: vec.y
    }
}

function vecAdd(vec1: Vec, vec2: Vec): Vec {
    return {
        x: vec1.x + vec2.x,
        y: vec1.y + vec2.y
    };
}

function vecSub(vec1: Vec, vec2: Vec): Vec {
    return {
        x: vec1.x - vec2.x,
        y: vec1.y - vec2.y
    };
}

function vecFromTo(vec1 : Vec, vec2 : Vec) : Vec {
    return {
        x: vec2.x - vec1.x,
        y: vec2.y - vec1.y
    };
}

function vecLength(vec : Vec) : number {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

function vecDist(vec1 : Vec, vec2 : Vec) : number {
    const fromTo = vecFromTo(vec1, vec2);
    return vecLength(fromTo);
}

function vecNormalize(vec : Vec, newLen: number = 1) : Vec {
    const len = vecLength(vec);
    if (len == 0) return vec;

    return {
        x: (vec.x / len) * newLen,
        y: (vec.y / len) * newLen
    };
}

function vecDirectionName(vec : Vec) : string {
    const ang = Math.atan2(vec.x, vec.y);
    const angAbs = Math.abs(ang);
    const angNeg = ang < 0;
    const piDiv4 = Math.PI/4;

    if (angAbs > piDiv4 * 3.5) {
        return "up";
    }
    if (angAbs > piDiv4 * 2.5) {
        return angNeg ? "upleft" : "upright";
    }
    if (angAbs > piDiv4 * 1.5) {
        return angNeg ? "left" : "right";
    }
    if (angAbs > piDiv4 * 0.5) {
        return angNeg ? "downleft" : "downright";
    }
    return "down";
}