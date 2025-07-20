"use strict";
function vecCopy(vec) {
    return {
        x: vec.x,
        y: vec.y
    };
}
function vecAdd(vec1, vec2) {
    return {
        x: vec1.x + vec2.x,
        y: vec1.y + vec2.y
    };
}
function vecSub(vec1, vec2) {
    return {
        x: vec1.x - vec2.x,
        y: vec1.y - vec2.y
    };
}
function vecEquals(vec1, vec2) {
    return (vec1.x === vec2.x) && (vec1.y === vec2.y);
}
function vecFromTo(vec1, vec2) {
    return vecSub(vec2, vec1);
}
function vecLength(vec) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}
function vecDist(vec1, vec2) {
    const fromTo = vecFromTo(vec1, vec2);
    return vecLength(fromTo);
}
function vecNormalize(vec, newLen = 1) {
    const len = vecLength(vec);
    if (len === 0)
        return vec;
    return {
        x: (vec.x / len) * newLen,
        y: (vec.y / len) * newLen
    };
}
function vecDirectionName(vec) {
    if (vec.x === 0 && vec.y === 0)
        return "none";
    const ang = Math.atan2(vec.x, vec.y);
    const angAbs = Math.abs(ang);
    const angNeg = ang < 0;
    const piDiv4 = Math.PI / 4;
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
function vecFromAngle(ang, len = 1) {
    const vec = {
        x: Math.sin(ang),
        y: Math.cos(ang)
    };
    if (len != 1)
        return vecNormalize(vec, len);
    else
        return vec;
}
function vecGetAngle(vec) {
    if (vec.x === 0 && vec.y === 0)
        return 0;
    return Math.atan2(vec.x, vec.y);
}
