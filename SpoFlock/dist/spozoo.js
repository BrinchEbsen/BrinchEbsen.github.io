"use strict";
;
let SpoSceneTargetCount = 200;
class SpoZoo {
    constructor(fps = 60) {
        this.fps = 0;
        this.frameInterval = 0;
        this.drawMsCurr = 0;
        this.drawMsLast = 0;
        this.inDrawLoop = false;
        this.setFps(fps);
        this.scene = {
            width: 10,
            height: 10,
            spos: [],
            particles: new Map()
        };
        this.setDimensions(this.scene.width, this.scene.height);
        this.createParticleSystems();
        this.mousePos = { x: 0, y: 0 };
    }
    createParticleSystems() {
        this.scene.particles.set(0, new ParticleSys(SparkleFrames, {
            loop: false,
            rate: 0.25
        }));
        this.scene.particles.set(1, new ParticleSys(WispFrames, {
            loop: true,
            lifespan: 60,
            endFadeIn: 20,
            startFadeOut: 40,
            rate: 0.25
        }));
    }
    addSpo(x, y) {
        const spo = new Spo({ x: x, y: y });
        const typeIndex = randomIntFromTo(0, SpoTypes.length);
        spo.setType(SpoTypes[typeIndex]);
        this.scene.spos.push(spo);
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
        CANVAS.width = window.innerWidth;
        CANVAS.height = window.innerHeight - CANVAS.offsetTop;
        this.setDimensions(CANVAS.width, CANVAS.height);
        setEnableScroll(false);
    }
    setDimensions(w, h) {
        this.scene.width = w;
        this.scene.height = h;
    }
    adjustSpoCount() {
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
    drawLoop(canvas, ctx) {
        if (!this.inDrawLoop)
            return;
        this.drawMsCurr = window.performance.now();
        if ((this.drawMsCurr - this.drawMsLast) > this.frameInterval) {
            this.drawMsLast = this.drawMsCurr;
            this.fitCanvas(canvas);
            this.adjustSpoCount();
            this.scene.spos.forEach(s => {
                s.step(this.scene);
            });
            this.scene.particles.forEach(sys => {
                sys.step();
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
        let sprites = this.scene.spos;
        sprites.sort((a, b) => {
            if (a.anchorPos.y > b.anchorPos.y)
                return 1;
            else
                return -1;
        });
        sprites.forEach(s => {
            s.draw(ctx);
        });
        this.scene.particles.forEach(sys => {
            sys.draw(ctx);
        });
    }
    mouseDown_Grab(mousePos) {
        this.scene.spos.forEach(s => {
            s.event_mousedown(mousePos);
        });
    }
    event_mousedown(mousePos) {
        this.mouseDown_Grab(mousePos);
    }
    event_mousemove(mousePos) {
        this.mousePos = vecCopy(mousePos);
        this.scene.spos.forEach(s => {
            s.event_mousemove(mousePos);
        });
    }
    event_mouseup(mousePos) {
        this.scene.spos.forEach(s => {
            s.event_mouseup(mousePos);
        });
    }
}
