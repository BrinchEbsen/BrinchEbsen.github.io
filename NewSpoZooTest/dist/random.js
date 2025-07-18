"use strict";
function randomFromTo(from, to) {
    let r = Math.random(); //from 0 to 1
    r *= (to - from); //from 0 to range length
    r += from; //from "from" to "to"
    return r;
}
function randomIntFromTo(from, to) {
    return Math.floor(randomFromTo(from, to));
}
function randomBool(chance = 0.5) {
    return Math.random() < chance;
}
