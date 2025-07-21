class Sparkle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.requestStop = false;

        this.animation = new Animation(sparkleFrames, 0.5, false);
    }

    draw() {
        if (this.requestStop) return;

        if (this.animation.stopped) {
            this.requestStop = true;
            return;
        }

        const x = this.x - (this.animation.width / 2);
        const y = this.y - (this.animation.height / 2);

        this.animation.draw(x, y);
    }
}