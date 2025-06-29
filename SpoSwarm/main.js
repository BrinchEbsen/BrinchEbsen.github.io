const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const frames = [];

for (let i = 0; i < 12; i++) {
    const img = new Image();
    img.src = `frames/spo_${i.toString().padStart(4, '0')}.png`;
    frames.push(img);
}

const spos = [];

function fitCanvasToWindow() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function sortSpos() {
    //The sum of a spo's x and y (respective to the lower-left corner)
    //can be used to find their "depth" into the scene
    spos.sort((s1, s2) => {
        return (s1.x + (canvas.height - s1.y)) <
               (s2.x + (canvas.height - s2.y));
    });
}

function drawFrame() {
    fitCanvasToWindow();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    spos.forEach(spo => {
        spo.move();
        if (spo.offScreen) {
            spo.pickNewStartPosition();
        }
    });

    sortSpos();
    spos.forEach(spo => {
        spo.draw(ctx);
    });
}

for (let i = 0; i < 100; i++) {
    fitCanvasToWindow();
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    spos.push(new Spo(x, y, frames));
}

setInterval(() => {
    drawFrame();
}, 1000/60);