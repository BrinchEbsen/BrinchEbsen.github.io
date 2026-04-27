const enum ParticleType {
    Sparkle,
    Wisp
};

type SpoZooScene = {
    width: number,
    height: number,
    spos: Spo[],
    particles: Map<ParticleType, ParticleSys>
};

let SpoSceneTargetCount = 200;

class SpoZoo {
    private inDrawLoop: boolean;
    public fps: number = 0;
    public frameInterval: number = 0;

    private drawMsCurr: number = 0;
    private drawMsLast: number = 0;

    public scene: SpoZooScene;

    public mousePos: Vec;

    constructor(
            fps: number = 60
        ) {
        this.inDrawLoop = false;
        this.setFps(fps);

        this.scene = {
            width: 10,
            height: 10,
            spos: [],
            particles: new Map<ParticleType, ParticleSys>()
        };

        this.setDimensions(this.scene.width, this.scene.height);

        this.createParticleSystems();

        this.mousePos = {x: 0, y: 0};
    }

    private createParticleSystems(): void {
        this.scene.particles.set(ParticleType.Sparkle,
            new ParticleSys(SparkleFrames, {
                loop: false,
                rate: 0.25
            })
        );
        this.scene.particles.set(ParticleType.Wisp,
            new ParticleSys(WispFrames, {
                loop: true,
                lifespan: 60,
                endFadeIn: 20,
                startFadeOut: 40,
                rate: 0.25
            })
        );
    }

    public addSpo(x: number, y: number): void {
        const spo = new Spo({x: x, y: y});
        
        const typeIndex = randomIntFromTo(0, SpoTypes.length);
        spo.setType(SpoTypes[typeIndex]);

        this.scene.spos.push(spo);
    }

    public setFps(fps : number): void {
        if (fps <= 0) throw new Error("Invalid framerate.");

        this.fps = fps;
        this.frameInterval = (1000.0 / fps);
    }

    public startDrawLoop(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D): void {
        if (this.inDrawLoop) return;

        this.inDrawLoop = true;

        this.drawMsCurr = window.performance.now();
        this.drawMsLast = this.drawMsCurr;
        
        this.drawLoop(canvas, ctx);
    }

    public endDrawLoop(): void {
        this.inDrawLoop = false;
    }

    public fitCanvas(canvas : HTMLCanvasElement): void {
        CANVAS.width = window.innerWidth;
        CANVAS.height = window.innerHeight - CANVAS.offsetTop;
        this.setDimensions(CANVAS.width, CANVAS.height);
        setEnableScroll(false);
    }

    public setDimensions(w: number, h: number): void {
        this.scene.width = w;
        this.scene.height = h;
    }

    private adjustSpoCount() {
        const diff = SpoSceneTargetCount - this.scene.spos.length;
        
        if (diff < 0) {
            for (let i = 0; i < -diff; i++) {
                const index = randomIntFromTo(0, this.scene.spos.length);
                this.scene.spos.splice(index, 1);
            }
        }
        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                this.addSpo(randomFromTo(0, this.scene.width), randomFromTo(0, this.scene.height));
            }
        }
    }

    private drawLoop(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D): void {
        if (!this.inDrawLoop) return;

        this.drawMsCurr = window.performance.now();

        if ((this.drawMsCurr - this.drawMsLast) > this.frameInterval) {
            this.drawMsLast = this.drawMsCurr;

            this.fitCanvas(canvas);
        
            this.adjustSpoCount();

            //Step spos
            this.scene.spos.forEach(s => {
                s.step(this.scene);
            });

            //Step particle systems
            this.scene.particles.forEach(sys => {
                sys.step();
            })

            this.drawFrame(ctx);
        }

        window.requestAnimationFrame(() => {
            this.drawLoop(canvas, ctx);
        });
    }

    private drawFrame(ctx : CanvasRenderingContext2D): void {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.scene.width, this.scene.height);

        let sprites: Sprite[] = this.scene.spos;

        sprites.sort((a : Sprite, b : Sprite) => {
            if (a.anchorPos.y > b.anchorPos.y) return 1;
            else return -1;
        });

        sprites.forEach(s => {
            s.draw(ctx);
        });

        this.scene.particles.forEach(sys => {
            sys.draw(ctx);
        })
    }

    public mouseDown_Grab(mousePos: Vec): void {
        this.scene.spos.forEach(s => {
            s.event_mousedown(mousePos);
        });
    }

    public event_mousedown(mousePos: Vec): void {
        this.mouseDown_Grab(mousePos);
    }

    public event_mousemove(mousePos: Vec): void {
        this.mousePos = vecCopy(mousePos);

        this.scene.spos.forEach(s => {
            s.event_mousemove(mousePos);
        });
    }

    public event_mouseup(mousePos: Vec): void {
        this.scene.spos.forEach(s => {
            s.event_mouseup(mousePos);
        });
    }
}