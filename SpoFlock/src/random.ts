function randomFromTo(from : number, to : number) : number {
    let r = Math.random(); //from 0 to 1
    r *= (to - from); //from 0 to range length
    r += from; //from "from" to "to"
    return r;
}

function randomIntFromTo(from : number, to : number) : number {
    return Math.floor(randomFromTo(from, to));
}

function randomBool(chance : number = 0.5) : boolean {
    return Math.random() < chance;
}