function randomFromTo(from, to) {
    let r = Math.random(); //from 0 to 1
    r *= (to - from); //from 0 to range length
    r += from; //from "from" to "to"
    return r;
}

//Create a promise that is fulfilled when all frames are loaded
//and also populate the frames array
function preloadFrames(framesObj, prefix) {
    const promises = [];
    for (let i = 0; i < 12; i++) {
        const img = new Image();
        img.src = `${prefix}${i.toString().padStart(4, '0')}.png`;
        framesObj.frames.push(img);

        promises.push(new Promise(resolve => {
            img.onload = resolve;
        }));
    }
    return Promise.all(promises);
}