"use strict";
function randomFromTo(from, to) {
    let r = Math.random();
    r *= (to - from);
    r += from;
    return r;
}
function randomIntFromTo(from, to) {
    return Math.floor(randomFromTo(from, to));
}
function randomBool(chance = 0.5) {
    return Math.random() < chance;
}
