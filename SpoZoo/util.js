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