"use strict";
function vecCopy(vec) {
    return {
        x: vec.x,
        y: vec.y
    };
}
function vecFromTo(vec1, vec2) {
    return {
        x: vec2.x - vec1.x,
        y: vec2.y - vec1.y
    };
}
function vecLength(vec) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}
function vecDist(vec1, vec2) {
    const fromTo = vecFromTo(vec1, vec2);
    return vecLength(fromTo);
}
function vecNormalize(vec) {
    const len = vecLength(vec);
    if (len == 0)
        return vec;
    return {
        x: vec.x / len,
        y: vec.y / len
    };
}
function vecDirectionName(vec) {
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
