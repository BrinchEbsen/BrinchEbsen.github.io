"use strict";
class SpoZoo {
    constructor(width = window.innerWidth, height = window.innerHeight, fps = 60) {
        this.fps = 0;
        this.frameInterval = 0;
        this.drawMsCurr = 0;
        this.drawMsLast = 0;
        this.inDrawLoop = false;
        this.setFps(fps);
        this.scene = {
            width: width,
            height: height,
            minWidth: 100,
            minHeight: 100,
            spos: []
        };
    }
    setFps(fps) {
        if (fps <= 0)
            throw new Error("Invalid framerate.");
        this.fps = fps;
        this.frameInterval = (1000.0 / fps);
    }
    startDrawLoop(canvas, ctx) {
        if (this.inDrawLoop)
            return;
        this.inDrawLoop = true;
        this.drawMsCurr = window.performance.now();
        this.drawMsLast = this.drawMsCurr;
        this.drawLoop(canvas, ctx);
    }
    endDrawLoop() {
        this.inDrawLoop = false;
    }
    fitCanvas(canvas) {
        this.scene.width = Math.max(window.innerWidth, this.scene.minWidth);
        this.scene.height = Math.max(window.innerHeight, this.scene.minHeight);
        if ((this.scene.width > window.innerWidth) ||
            (this.scene.height > window.innerHeight))
            setEnableScroll(true);
        else
            setEnableScroll(false);
        canvas.width = this.scene.width;
        canvas.height = this.scene.height;
    }
    drawLoop(canvas, ctx) {
        if (!this.inDrawLoop)
            return;
        this.drawMsCurr = window.performance.now();
        if ((this.drawMsCurr - this.drawMsLast) > this.frameInterval) {
            this.drawMsLast = this.drawMsCurr;
            this.fitCanvas(canvas);
            this.scene.spos.forEach(s => {
                s.step(this.scene);
            });
            this.drawFrame(ctx);
        }
        window.requestAnimationFrame(() => {
            this.drawLoop(canvas, ctx);
        });
    }
    drawFrame(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.scene.width, this.scene.height);
        const sprites = this.scene.spos;
        sprites.sort((a, b) => {
            if (a.pos.y > b.pos.y)
                return 1;
            else
                return -1;
        });
        sprites.forEach(s => {
            s.draw(ctx);
        });
    }
}
