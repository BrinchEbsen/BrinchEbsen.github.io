class Animation {
    constructor(name, rate) {
        this.name = name;
        this.rate = rate;

        this.timeLine = 0;
    }

    draw(x, y, rateMult = 1, sizeMult = 1) {
        this.timeLine += this.rate*rateMult;
        this.timeLine %= frames[this.name].length;
        const frame = Math.floor(this.timeLine);
        const img = frames[this.name][frame];

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

        ctx.drawImage(img, ix, iy, iw, ih);
    }
}