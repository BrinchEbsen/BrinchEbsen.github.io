class Animation {
    constructor(name, rate) {
        this.name = name;
        this.rate = rate;

        this.timeLine = 0;
    }

    draw(x, y) {
        this.timeLine += this.rate;
        this.timeLine %= frames[this.name].length;
        const frame = Math.floor(this.timeLine);

        ctx.drawImage(frames[this.name][frame], x, y);
    }
}