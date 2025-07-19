"use strict";
/**
 * Copy a vector.
 * @param vec Vector to copy.
 * @returns A new vector which is identical to the input.
 */
function vecCopy(vec) {
    return {
        x: vec.x,
        y: vec.y
    };
}
/**
 * Add the components of two vectors.
 * @param vec1 First vector.
 * @param vec2 Second vector.
 * @returns A new vector which has the sums of the input vectors' components.
 */
function vecAdd(vec1, vec2) {
    return {
        x: vec1.x + vec2.x,
        y: vec1.y + vec2.y
    };
}
/**
 * Subtract the components of two vectors.
 * @param vec1 First vector.
 * @param vec2 Second vector.
 * @returns A new vector with vec1's components minus vec2's components.
 */
function vecSub(vec1, vec2) {
    return {
        x: vec1.x - vec2.x,
        y: vec1.y - vec2.y
    };
}
/**
 * Create vector from one vector to another.
 * @param vec1 Starting vector.
 * @param vec2 Ending vector.
 * @returns A new vector which spans the distance between vec1 and vec2.
 */
function vecFromTo(vec1, vec2) {
    return vecSub(vec2, vec1);
}
/**
 * Get the length of a vector.
 * @param vec Input vector.
 * @returns The length of the vector.
 */
function vecLength(vec) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}
/**
 * The distance between two vectors.
 * @param vec1 First vector.
 * @param vec2 Second vector.
 * @returns The distance between vec1 and vec2.
 */
function vecDist(vec1, vec2) {
    const fromTo = vecFromTo(vec1, vec2);
    return vecLength(fromTo);
}
/**
 * Create a new vector of a new length.
 * @param vec Input vector.
 * @param newLen The new length of the vector (1 by default).
 * @returns A new vector with the same direction as the input, but with the new length.
 */
function vecNormalize(vec, newLen = 1) {
    const len = vecLength(vec);
    if (len === 0)
        return vec;
    return {
        x: (vec.x / len) * newLen,
        y: (vec.y / len) * newLen
    };
}
/**
 * Get one of 8 strings which describes the direction of a vector.
 * @param vec Input vector.
 * @returns A string describing the length of a vector.
 */
function vecDirectionName(vec) {
    if (vec.x === 0 && vec.y === 0)
        return "none";
    const ang = Math.atan2(vec.x, vec.y);
    const angAbs = Math.abs(ang);
    const angNeg = ang < 0;
    const piDiv4 = Math.PI / 4; // 1/8th rotation
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
/**
 * Create a vector with a given angle and length.
 * @param ang Angle in radians.
 * @param len Length (1 by default).
 * @returns A new vector that faces the given angle and has the given length.
 */
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
/**
 * Get the angle in radians of a vector.
 * @param vec Input.
 * @returns The angle in radians (-PI to PI) of the input vector.
 */
function vecGetAngle(vec) {
    if (vec.x === 0 && vec.y === 0)
        return 0;
    return Math.atan2(vec.x, vec.y);
}
