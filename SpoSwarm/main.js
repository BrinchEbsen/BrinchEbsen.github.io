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
    //Using cross-product to determine difference in depth
    spos.sort((s1, s2) => {
        const dx = s2.x - s1.x;
        const dy = s2.y - s1.y;
        const cross = (dx - dy);
        
        if (cross < 0) return -1;
        if (cross > 0) return 1;
        return 0;
    });
}

let mX;
let mY;

document.addEventListener('mousemove', (ev) => {
    mX = ev.clientX;
    mY = ev.clientY;
});

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