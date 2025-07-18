type SpoZooScene = {
    spos : Spo[]
};

class SpoZoo {
    private inDrawLoop : boolean;
    public fps : number = 0;
    public frameInterval : number = 0;

    private drawMsCurr : number = 0;
    private drawMsLast : number = 0;

    public scene : SpoZooScene;

    constructor(fps : number = 60) {
        this.inDrawLoop = false;
        this.setFps(fps);

        this.scene = {
            spos: []
        };
    }

    public setFps(fps : number) {
        if (fps <= 0) throw new Error("Invalid framerate.");

        this.fps = fps;
        this.frameInterval = (1000.0 / fps);
    }

    public startDrawLoop(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) {
        if (this.inDrawLoop) return;

        this.inDrawLoop = true;

        this.drawMsCurr = window.performance.now();
        this.drawMsLast = this.drawMsCurr;
        
        this.drawLoop(canvas, ctx);
    }

    public endDrawLoop() {
        this.inDrawLoop = false;
    }

    private fitCanvas(canvas : HTMLCanvasElement) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    private drawLoop(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) {
        if (!this.inDrawLoop) return;

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

    private drawFrame(ctx : CanvasRenderingContext2D) {
        const sprites : Sprite[] = this.scene.spos;

        sprites.sort((a : Sprite, b : Sprite) => {
            if (a.pos.y > b.pos.y) return 1;
            else return -1;
        });

        sprites.forEach(s => {
            s.draw(ctx);
        });
    }
}

const gSpoZoo = new SpoZoo();