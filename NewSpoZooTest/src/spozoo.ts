type SpoZooScene = {
    width: number,
    height: number,
    minWidth: number,
    minHeight: number,
    spos: Spo[],
    fences: Fence[],
    sparkles: ParticleSys
};

type FenceBuildState = {
    build: boolean,
    remove: boolean,
    mousePos: Vec,
    tileFlasher: Flasher
};

const enum InteractMode {
    Spos,
    Fence
}

class SpoZoo {
    private inDrawLoop: boolean;
    public fps: number = 0;
    public frameInterval: number = 0;

    private drawMsCurr: number = 0;
    private drawMsLast: number = 0;

    public currentInteractMode: InteractMode;
    public scene: SpoZooScene;

    public spoDensityTarget: number;
    public spoLimit: number = 1000;

    public fenceBuildState: FenceBuildState;

    constructor(
            width : number = window.innerWidth,
            height : number = window.innerHeight,
            fps : number = 60
        ) {
        this.inDrawLoop = false;
        this.setFps(fps);

        this.currentInteractMode = InteractMode.Spos;

        this.scene = {
            width: width,
            height: height,
            minWidth: 400,
            minHeight: 400,
            spos: [],
            fences: [],
            sparkles: new ParticleSys(SparkleFrames, {
                loop: false, lifespan: -1, rate: 0.25
            })
        };

        this.spoDensityTarget = 0.5;

        this.fenceBuildState = {
            build: false,
            remove: false,
            mousePos: {x: 0, y: 0},
            tileFlasher: new Flasher(0x10, 0x60, 6)
        };

        //TEST
        this.scene.fences.push(new Fence({x: 6, y: 4}));
        this.scene.fences.push(new Fence({x: 7, y: 4}));
        this.scene.fences.push(new Fence({x: 7, y: 5}));
        this.scene.fences.forEach(f => {
            f.updateNeighbors(this.scene);
        });
    }

    public spoTargetDeviation(): number {
        const oneSpo = SpoBoundBoxSize*SpoBoundBoxSize;
        const spoPixels = oneSpo * this.scene.spos.length;
        const canvasPixels = this.scene.height * this.scene.width;
        
        const targetPixels = Math.floor(this.spoDensityTarget * canvasPixels);
        const pixelsDeviation = targetPixels - spoPixels;

        return Math.floor(pixelsDeviation / oneSpo);
    }

    public numSposSetForDespawn(): number {
        let num: number = 0;

        this.scene.spos.forEach(s => {
            if (s.despawn) num++;
        });

        return num;
    }

    public addSpo(): void {
        let spoPos: Vec;

        if (randomBool()) {
            spoPos = {
                x: randomBool() ? -SpoFrameSize : this.scene.width,
                y: randomFromTo(0, this.scene.height-SpoFrameSize)
            };
        } else {
            spoPos = {
                x: randomFromTo(0, this.scene.width-SpoFrameSize),
                y: randomBool() ? -SpoFrameSize : this.scene.height
            };
        }

        const spo = new Spo(spoPos);
        this.scene.spos.push(spo);
    }

    public setRandomSpoForDespawn(): void {
        for (let i = 0; i < this.scene.spos.length; i++) {
            if (!this.scene.spos[i].despawn)
                this.scene.spos[i].despawn = true;

            break;
        }
    }

    public testAdjustSpoAmount(): void {
        const deviation = this.spoTargetDeviation();

        if (deviation > 0 && this.scene.spos.length < this.spoLimit)
            this.addSpo();
        
        if (deviation < 0) {
            const numDespawn = this.numSposSetForDespawn();

            const numToDespawn = Math.abs(deviation) - numDespawn;

            if (numToDespawn > 0)
                this.setRandomSpoForDespawn();
        }
    }

    public purgeSpos(): void {
        for (let i = 0; i < this.scene.spos.length; i++) {
            const spo = this.scene.spos[i];

            if (spo.requestDelete) {
                this.scene.spos.splice(i, 1);
                i--; //to account for array mutation
            }
        }
    }

    public fenceAtTile(pos: Vec): number {
        for (let i = 0; i < this.scene.fences.length; i++) {
            const tilePos = this.scene.fences[i].tilePos;
            if (tilePos.x == pos.x && tilePos.y == pos.y) {
                return i;
            }
        }

        return -1;
    }

    public setFenceAtTile(pos: Vec, fenceIndex: number | undefined = undefined) {
        if (!fenceIndex)
            fenceIndex = this.fenceAtTile(pos);

        if (this.fenceBuildState.build && fenceIndex < 0) {
            this.scene.fences.push(new Fence(pos));
        } else if (this.fenceBuildState.remove && fenceIndex >= 0) {
            this.scene.fences.splice(fenceIndex, 1);
        }

        this.scene.fences.forEach(f => {
            f.updateNeighbors(this.scene);
        });
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

    private fitCanvas(canvas : HTMLCanvasElement): void {
        this.scene.width  = Math.max(window.innerWidth,  this.scene.minWidth);
        this.scene.height = Math.max(window.innerHeight, this.scene.minHeight);
        
        if ((this.scene.width  > window.innerWidth) ||
            (this.scene.height > window.innerHeight))
            setEnableScroll(true);
        else
            setEnableScroll(false);

        canvas.width = this.scene.width;
        canvas.height = this.scene.height;
    }

    private drawFenceTile(ctx: CanvasRenderingContext2D): void {
        const val = this.fenceBuildState.tileFlasher.next();

        let valHex = val.toString(16);
        if (valHex.length === 1) valHex = '0'+valHex;

        ctx.fillStyle = "#"+valHex+valHex+valHex;

        let tileX = Math.floor(this.fenceBuildState.mousePos.x / FenceTileSize);
        let tileY = Math.floor(this.fenceBuildState.mousePos.y / FenceTileSize);

        ctx.fillRect(tileX * FenceTileSize, tileY * FenceTileSize, FenceTileSize, FenceTileSize);
    }

    private drawLoop(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D): void {
        if (!this.inDrawLoop) return;

        this.drawMsCurr = window.performance.now();

        if ((this.drawMsCurr - this.drawMsLast) > this.frameInterval) {
            this.drawMsLast = this.drawMsCurr;

            this.fitCanvas(canvas);

            if (randomBool(0.25)) this.testAdjustSpoAmount();

            this.purgeSpos();

            this.scene.spos.forEach(s => {
                s.step(this.scene);
            });

            this.scene.sparkles.step();

            this.drawFrame(ctx);
        }

        window.requestAnimationFrame(() => {
            this.drawLoop(canvas, ctx);
        });
    }

    private drawFrame(ctx : CanvasRenderingContext2D): void {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.scene.width, this.scene.height);

        if (this.currentInteractMode === InteractMode.Fence)
            this.drawFenceTile(ctx);

        let sprites : Sprite[] = this.scene.spos;
        sprites = sprites.concat(this.scene.fences);

        sprites.sort((a : Sprite, b : Sprite) => {
            //Sort the grabbed spo above all other spos
            if (a instanceof Spo && b instanceof Spo) {
                const aGrab = a.state === SpoState.Grabbed;
                const bGrab = b.state === SpoState.Grabbed;

                if (aGrab && !bGrab) return 1;
                if (!aGrab && bGrab) return -1;
            }

            if (a.anchorPos.y > b.anchorPos.y) return 1;
            else return -1;
        });

        sprites.forEach(s => {
            s.draw(ctx);
        });

        this.scene.sparkles.draw(ctx);
    }

    public mouseDown_Spos(mousePos: Vec): void {
        let checkGrab = true;

        this.scene.spos.forEach(s => {
            s.event_mousedown(mousePos, checkGrab);

            if (s.state === SpoState.Grabbed)
                checkGrab = false;
        });
    }

    public mouseDown_Fence(mousePos: Vec): void {
        this.fenceBuildState.mousePos = vecCopy(mousePos);

        let tileX = Math.floor(this.fenceBuildState.mousePos.x / FenceTileSize);
        let tileY = Math.floor(this.fenceBuildState.mousePos.y / FenceTileSize);

        const fenceIndex = this.fenceAtTile({x: tileX, y: tileY});

        //Build fence if no fence is there
        this.fenceBuildState.build = fenceIndex < 0;
        this.fenceBuildState.remove = fenceIndex >= 0;

        this.setFenceAtTile(
            {x: tileX, y: tileY},
            fenceIndex
        );
    }

    public event_mousedown(mousePos: Vec): void {
        switch (this.currentInteractMode) {
            case InteractMode.Spos:
                this.mouseDown_Spos(mousePos);
                break;
            case InteractMode.Fence:
                this.mouseDown_Fence(mousePos);
                break;
        }
    }

    public mouseMove_fence(mousePos: Vec) {
        this.fenceBuildState.mousePos = vecCopy(mousePos);

        let tileX = Math.floor(this.fenceBuildState.mousePos.x / FenceTileSize);
        let tileY = Math.floor(this.fenceBuildState.mousePos.y / FenceTileSize);

        const fenceIndex = this.fenceAtTile({x: tileX, y: tileY});

        this.setFenceAtTile(
            {x: tileX, y: tileY},
            fenceIndex
        );
    }

    public event_mousemove(mousePos: Vec): void {
        this.scene.spos.forEach(s => {
            s.event_mousemove(mousePos);
        });

        this.mouseMove_fence(mousePos);
    }

    public mouseUp_fence(mousePos: Vec) {
        this.fenceBuildState.build = false;
        this.fenceBuildState.remove = false;
    }

    public event_mouseup(mousePos: Vec): void {
        this.scene.spos.forEach(s => {
            s.event_mouseup(mousePos);
        });

        if (this.currentInteractMode === InteractMode.Fence) {
            this.mouseUp_fence(mousePos);
        }
    }

    public event_keydown(ev: KeyboardEvent): void {

    }

    public event_keyup(ev: KeyboardEvent): void {
        
    }

    public event_keypress(ev: KeyboardEvent): void {
        const key = ev.key;
        
        switch(key) {
            case "s":
                this.currentInteractMode = InteractMode.Spos;
                break;
            case "f":
                this.currentInteractMode = InteractMode.Fence;
                break;
        }
    }
}