class Spo {
    constructor(x, y, frames) {
        this.x = x;
        this.y = y;
        this.frames = frames;

        this.timeLine = 0;
    }

    get width() {
        return frames[0].width;
    }
    get height() {
        return frames[0].height;
    }

    chooseRandomFrame() {
        this.timeLine = Math.random() * this.frames.length;
    }

    move() {
        this.x += spoSpeed;
        this.y += spoSpeed;
    }

    draw(ctx) {
        this.timeLine += spoAnimSpeed;
        this.timeLine %= this.frames.length;
        const frame = Math.floor(this.timeLine);

        ctx.drawImage(this.frames[frame], this.x, this.y);
    }

    get offScreen() {
        return (this.x > canvas.width || this.y > canvas.height);
    }

    pickNewStartPosition() {
        if (Math.random() > 0.5) {
            this.x = -this.width;
            this.y = randomFromTo(-this.height, canvas.height);
        } else {
            this.y = -this.height;
            this.x = randomFromTo(-this.width, canvas.width);
        }
    }
}