class SpriteAnimation {
    public frames : HTMLImageElement[];
    public loops : boolean;
    public rate : number;
    public running : boolean;

    public timeline : number;

    constructor(
        frames : HTMLImageElement[],
        loops : boolean = false,
        rate : number = 1
    ) {
        this.frames = frames;
        this.loops = loops;
        if (rate <= 0) throw new Error(`Invalid animation rate: ${rate}.`);
        this.rate = rate;

        this.running = true;

        this.timeline = 0;
    }

    restart() : void {
        this.timeline = 0;
        this.running = true;
    }

    draw(ctx : CanvasRenderingContext2D, pos : Vec, sizeMult : number = 1, rateMult : number = 1) : void {
        if (!this.running) return;
        if (this.frames.length == 0) return;

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

        let ix : number = pos.x;
        let iy : number = pos.y;
        let iw : number = img.width;
        let ih : number = img.height;

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