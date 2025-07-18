type Vec = { x: number, y: number };

function vecFromTo(vec1 : Vec, vec2 : Vec) : Vec {
    return {
        x: vec2.x - vec1.x,
        y: vec2.y - vec1.y
    };
}

function vecLength(vec : Vec) : number {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

function vecNormalize(vec : Vec) : Vec {
    const len = vecLength(vec);
    if (len == 0) return vec;

    return {
        x: vec.x / len,
        y: vec.y / len
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