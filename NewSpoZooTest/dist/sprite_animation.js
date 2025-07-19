"use strict";
class SpriteAnimation {
    constructor(frames, loops = false, rate = 1) {
        this.frames = frames;
        this.loops = loops;
        if (rate <= 0)
            throw new Error(`Invalid animation rate: ${rate}.`);
        this.rate = rate;
        this.running = this.frames.length == 0 ? false : true;
        this.timeline = 0;
    }
    restart() {
        this.timeline = 0;
        this.running = true;
    }
    draw(ctx, pos, sizeMult = 1, rateMult = 1) {
        if (!this.running)
            return;
        if (this.frames.length == 0)
            return;
        this.timeline += this.rate * rateMult;
        if (!this.loops) {
            if (this.timeline >= this.frames.length) {
                this.running = false;
                return;
            }
        }
        this.timeline %= this.frames.length;
        const frameIndex = Math.floor(this.timeline);
        const img = this.frames[frameIndex];
        let ix = pos.x;
        let iy = pos.y;
        let iw = img.width;
        let ih = img.height;
        if (sizeMult != 1) {
            iw *= sizeMult;
            ih *= sizeMult;
            ix -= (iw - img.width) / 2;
            iy -= (ih - img.height) / 2;
        }
        ix = Math.floor(ix);
        iy = Math.floor(iy);
        iw = Math.floor(iw);
        ih = Math.floor(ih);
        ctx.drawImage(img, ix, iy, iw, ih);
    }
}
