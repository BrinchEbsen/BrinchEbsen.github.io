class Animation {
    constructor(frames, rate, loop = true) {
        this.frames = frames;
        this.rate = rate;
        this.loop = loop;
        this.stopped = false;

        this.timeLine = 0;
    }

    get width() {
        if (this.frames.length > 0) {
            return this.frames[0].width;
        } else {
            return 0;
        }
    }

    get height() {
        if (this.frames.length > 0) {
            return this.frames[0].height;
        } else {
            return 0;
        }
    }

    draw(x, y, rateMult = 1, sizeMult = 1) {
        if (this.stopped) return;

        this.timeLine += this.rate*rateMult;

        if (!this.loop) {
            if (this.timeLine >= this.frames.length) {
                this.stopped = true;
                return;
            }
        }

        this.timeLine %= this.frames.length;


        const frame = Math.floor(this.timeLine);
        const img = this.frames[frame];

        let ix = x;
        let iy = y;
        let iw = img.width;
        let ih = img.height;

        if (sizeMult != 1) {
            iw *= sizeMult;
            ih *= sizeMult;
            ix -= (iw-img.width)/2;
            iy -= (ih-img.height)/2;
        }

        ix = Math.floor(ix);
        iy = Math.floor(iy);
        iw = Math.floor(iw);
        ih = Math.floor(ih);

        ctx.drawImage(img, ix, iy, iw, ih);
    }
}