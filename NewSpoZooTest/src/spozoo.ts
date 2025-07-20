const enum ParticleType {
    Sparkle,
    Sweat
};

type SpoZooScene = {
    width: number,
    height: number,
    minTileWidth: number,
    minTileHeight: number,
    maxTileWidth: number,
    maxTileHeight: number,
    removeSpos: boolean,
    spos: Spo[],
    fences: Fence[],
    grass: Grass[],
    particles: Map<ParticleType, ParticleSys>
};

type TileBuildState = {
    build: boolean,
    remove: boolean,
    tileFlasher: Flasher
};

const enum InteractMode {
    Spos,
    Fence,
    Grass
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

    public tileBuildState: TileBuildState;

    public mousePos: Vec;

    constructor(
            tileWidth: number,
            tileHeight: number,
            fps: number = 60
        ) {
        this.inDrawLoop = false;
        this.setFps(fps);

        this.currentInteractMode = InteractMode.Spos;

        this.scene = {
            width: tileWidth * TileSize,
            height: tileHeight * TileSize,
            minTileWidth: 4,
            minTileHeight: 4,
            maxTileWidth: 100,
            maxTileHeight: 100,
            removeSpos: false,
            spos: [],
            fences: [],
            grass: [],
            particles: new Map<ParticleType, ParticleSys>
        };

        this.setDimensions(tileWidth, tileHeight);

        this.createParticleSystems();

        this.spoDensityTarget = 0.5;

        this.tileBuildState = {
            build: false,
            remove: false,
            tileFlasher: new Flasher(0x10, 0xA0, 10)
        };

        this.mousePos = {x: 0, y: 0};
    }

    get sceneTileWidth(): number {
        return Math.floor(this.scene.width / TileSize);
    }
    get sceneTileHeight(): number {
        return Math.floor(this.scene.height / TileSize);
    }

    private createParticleSystems(): void {
        this.scene.particles.set(ParticleType.Sparkle,
            new ParticleSys(SparkleFrames, {
                loop: false,
                rate: 0.25
            })
        );
        this.scene.particles.set(ParticleType.Sweat, 
            new ParticleSys([SweatDropFrame], {
                loop: true,
                lifespan: 8,
                startFadeOut: 0,
                rate: 1,
                size: 0.5
            })
        );
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
        
        const typeIndex = randomIntFromTo(0, SpoTypes.length);
        spo.setType(SpoTypes[typeIndex]);

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
            if (randomBool(0.25)) this.addSpo();
        
        this.scene.removeSpos = deviation < 0;
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

    public positionOutOfBounds(pos: Vec): boolean {
        return (pos.x * TileSize) < 0 || (pos.x * TileSize) >= this.scene.width ||
               (pos.y * TileSize) < 0 || (pos.y * TileSize) >= this.scene.height;
    }

    public objectAtTile(pos: Vec, array: TiledSprite[]): number {
        for (let i = 0; i < array.length; i++) {
            const tilePos = array[i].tilePos;
            if (tilePos.x == pos.x && tilePos.y == pos.y) {
                return i;
            }
        }

        return -1;
    }

    public setFenceAtTile(pos: Vec, fenceIndex: number | undefined = undefined) {
        if (!fenceIndex)
            fenceIndex = this.objectAtTile(pos, this.scene.fences);

        //Don't place if out of bounds.
        if (this.positionOutOfBounds(pos)) return;

        if (this.tileBuildState.build && fenceIndex < 0) {
            this.scene.fences.push(new Fence(vecCopy(pos)));
        } else if (this.tileBuildState.remove && fenceIndex >= 0) {
            this.scene.fences.splice(fenceIndex, 1);
        }

        this.scene.fences.forEach(f => {
            f.updateNeighbors(this.scene);
        });
    }

    public setGrassAtTile(pos: Vec, grassIndex: number | undefined = undefined) {
        if (!grassIndex)
            grassIndex = this.objectAtTile(pos, this.scene.grass);

        //Don't place if out of bounds.
        if (this.positionOutOfBounds(pos)) return;

        if (this.tileBuildState.build && grassIndex < 0) {
            this.scene.grass.push(new Grass(vecCopy(pos)));
        } else if (this.tileBuildState.remove && grassIndex >= 0) {
            this.scene.grass.splice(grassIndex, 1);
        }
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
        //this.scene.width  = Math.max(window.innerWidth,  this.scene.minWidth);
        //this.scene.height = Math.max(window.innerHeight, this.scene.minHeight);
        //
        //if ((this.scene.width  > window.innerWidth) ||
        //    (this.scene.height > window.innerHeight))
        //    setEnableScroll(true);
        //else
        //    setEnableScroll(false);

        canvas.width = this.scene.width;
        canvas.height = this.scene.height;
    }

    private getMouseTilePos(mousePos: Vec): Vec {
        return {
            x: Math.floor(mousePos.x / TileSize),
            y: Math.floor(mousePos.y / TileSize)
        };
    }

    private drawFlashingTile(ctx: CanvasRenderingContext2D): void {
        const val = this.tileBuildState.tileFlasher.next();

        let valHex = val.toString(16);
        if (valHex.length === 1) valHex = '0'+valHex;

        ctx.fillStyle = "#"+valHex+valHex+valHex+valHex;

        let tileX = Math.floor(this.mousePos.x / TileSize);
        let tileY = Math.floor(this.mousePos.y / TileSize);

        ctx.fillRect(tileX * TileSize, tileY * TileSize, TileSize, TileSize);
    }

    private getMinimumAllowedSceneTileSize(): Rect {
        const r = {
            x: 0,
            y: 0,
            w: this.scene.minTileWidth,
            h: this.scene.minTileHeight
        }

        let tileSprites: TiledSprite[] = [];
        tileSprites = tileSprites.concat(this.scene.fences, this.scene.grass);

        tileSprites.forEach(s => {
            const tp = s.tilePos;

            if (tp.x+1 > r.w) r.w = tp.x+1;
            if (tp.y+1 > r.h) r.h = tp.y+1;
        });

        return r;
    }

    public setDimensions(w: number, h: number): void {
        const minSize = this.getMinimumAllowedSceneTileSize();

        if (w < minSize.w)  w = minSize.w;
        if (w > this.scene.maxTileWidth)  w = this.scene.maxTileWidth;

        if (h < minSize.h) h = minSize.h;
        if (h > this.scene.maxTileHeight) h = this.scene.maxTileHeight;

        this.scene.width  = w * TileSize;
        this.scene.height = h * TileSize;
    }

    private drawLoop(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D): void {
        if (!this.inDrawLoop) return;

        this.drawMsCurr = window.performance.now();

        if ((this.drawMsCurr - this.drawMsLast) > this.frameInterval) {
            this.drawMsLast = this.drawMsCurr;

            this.fitCanvas(canvas);

            this.testAdjustSpoAmount();

            //Purge spos to be deleted
            this.purgeSpos();

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

        this.scene.grass.forEach(g => {
            g.draw(ctx);
        });

        if (this.currentInteractMode === InteractMode.Fence ||
            this.currentInteractMode === InteractMode.Grass
        ) {
            this.drawFlashingTile(ctx);
        }

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

        this.scene.particles.forEach(sys => {
            sys.draw(ctx);
        })
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
        let tilePos = this.getMouseTilePos(this.mousePos);

        const fenceIndex = this.objectAtTile(tilePos, this.scene.fences);

        //Build fence if no fence is there
        this.tileBuildState.build = fenceIndex < 0;
        this.tileBuildState.remove = fenceIndex >= 0;

        this.setFenceAtTile(tilePos, fenceIndex);
    }

    public mouseDown_Grass(mousePos: Vec): void {
        let tilePos = this.getMouseTilePos(this.mousePos);

        const grassIndex = this.objectAtTile(tilePos, this.scene.grass);

        //Build fence if no fence is there
        this.tileBuildState.build = grassIndex < 0;
        this.tileBuildState.remove = grassIndex >= 0;

        this.setGrassAtTile(tilePos, grassIndex);
    }

    public event_mousedown(mousePos: Vec): void {
        switch (this.currentInteractMode) {
            case InteractMode.Spos:
                this.mouseDown_Spos(mousePos);
                break;
            case InteractMode.Fence:
                this.mouseDown_Fence(mousePos);
                break;
            case InteractMode.Grass:
                this.mouseDown_Grass(mousePos);
                break;
        }
    }

    public mouseMove_Fence(mousePos: Vec) {
        if (!this.tileBuildState.build && !this.tileBuildState.remove) return;

        const tilePos = this.getMouseTilePos(mousePos);

        const fenceIndex = this.objectAtTile(tilePos, this.scene.fences);

        this.setFenceAtTile(
            tilePos,
            fenceIndex
        );
    }

    public mouseMove_Grass(mousePos: Vec): void {
        if (!this.tileBuildState.build && !this.tileBuildState.remove) return;

        const tilePos = this.getMouseTilePos(mousePos);

        const grassIndex = this.objectAtTile(tilePos, this.scene.grass);

        this.setGrassAtTile(
            tilePos,
            grassIndex
        );
    }

    public event_mousemove(mousePos: Vec): void {
        this.mousePos = vecCopy(mousePos);

        this.scene.spos.forEach(s => {
            s.event_mousemove(mousePos);
        });

        switch(this.currentInteractMode) {
            case InteractMode.Fence:
                this.mouseMove_Fence(mousePos);
                break;
            case InteractMode.Grass:
                this.mouseMove_Grass(mousePos);
                break;
        }
    }

    public mouseUp_Tiles(mousePos: Vec) {
        this.tileBuildState.build = false;
        this.tileBuildState.remove = false;
    }

    public event_mouseup(mousePos: Vec): void {
        this.scene.spos.forEach(s => {
            s.event_mouseup(mousePos);
        });

        if (this.currentInteractMode === InteractMode.Fence ||
            this.currentInteractMode === InteractMode.Grass
        ) {
            this.mouseUp_Tiles(mousePos);
        }
    }

    public event_keydown(ev: KeyboardEvent): void {

    }

    public event_keyup(ev: KeyboardEvent): void {
        
    }

    public event_keypress(ev: KeyboardEvent): void {
        
    }
}