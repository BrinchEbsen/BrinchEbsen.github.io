"use strict";
;
class SpoZoo {
    constructor(tileWidth, tileHeight, fps = 60) {
        this.fps = 0;
        this.frameInterval = 0;
        this.drawMsCurr = 0;
        this.drawMsLast = 0;
        this.spoLimit = 1000;
        this.inDrawLoop = false;
        this.setFps(fps);
        this.currentInteractMode = 0 /* InteractMode.Spos */;
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
            particles: new Map
        };
        this.setDimensions(tileWidth, tileHeight);
        this.createParticleSystems();
        this.spoDensityTarget = 0.5;
        this.tileBuildState = {
            build: false,
            remove: false,
            tileFlasher: new Flasher(0x10, 0xA0, 10)
        };
        this.mousePos = { x: 0, y: 0 };
    }
    get sceneTileWidth() {
        return Math.floor(this.scene.width / TileSize);
    }
    get sceneTileHeight() {
        return Math.floor(this.scene.height / TileSize);
    }
    createParticleSystems() {
        this.scene.particles.set(0 /* ParticleType.Sparkle */, new ParticleSys(SparkleFrames, {
            loop: false,
            rate: 0.25
        }));
        this.scene.particles.set(1 /* ParticleType.Sweat */, new ParticleSys([SweatDropFrame], {
            loop: true,
            lifespan: 8,
            startFadeOut: 0,
            rate: 1,
            size: 0.5
        }));
    }
    spoTargetDeviation() {
        const oneSpo = SpoBoundBoxSize * SpoBoundBoxSize;
        const spoPixels = oneSpo * this.scene.spos.length;
        const canvasPixels = this.scene.height * this.scene.width;
        const targetPixels = Math.floor(this.spoDensityTarget * canvasPixels);
        const pixelsDeviation = targetPixels - spoPixels;
        return Math.floor(pixelsDeviation / oneSpo);
    }
    numSposSetForDespawn() {
        let num = 0;
        this.scene.spos.forEach(s => {
            if (s.despawn)
                num++;
        });
        return num;
    }
    addSpo() {
        let spoPos;
        if (randomBool()) {
            spoPos = {
                x: randomBool() ? -SpoFrameSize : this.scene.width,
                y: randomFromTo(0, this.scene.height - SpoFrameSize)
            };
        }
        else {
            spoPos = {
                x: randomFromTo(0, this.scene.width - SpoFrameSize),
                y: randomBool() ? -SpoFrameSize : this.scene.height
            };
        }
        const spo = new Spo(spoPos);
        const typeIndex = randomIntFromTo(0, SpoTypes.length);
        spo.setType(SpoTypes[typeIndex]);
        this.scene.spos.push(spo);
    }
    setRandomSpoForDespawn() {
        for (let i = 0; i < this.scene.spos.length; i++) {
            if (!this.scene.spos[i].despawn)
                this.scene.spos[i].despawn = true;
            break;
        }
    }
    testAdjustSpoAmount() {
        const deviation = this.spoTargetDeviation();
        if (deviation > 0 && this.scene.spos.length < this.spoLimit)
            if (randomBool(0.25))
                this.addSpo();
        this.scene.removeSpos = deviation < 0;
    }
    purgeSpos() {
        for (let i = 0; i < this.scene.spos.length; i++) {
            const spo = this.scene.spos[i];
            if (spo.requestDelete) {
                this.scene.spos.splice(i, 1);
                i--; //to account for array mutation
            }
        }
    }
    positionOutOfBounds(pos) {
        return (pos.x * TileSize) < 0 || (pos.x * TileSize) >= this.scene.width ||
            (pos.y * TileSize) < 0 || (pos.y * TileSize) >= this.scene.height;
    }
    objectAtTile(pos, array) {
        for (let i = 0; i < array.length; i++) {
            const tilePos = array[i].tilePos;
            if (tilePos.x == pos.x && tilePos.y == pos.y) {
                return i;
            }
        }
        return -1;
    }
    setFenceAtTile(pos, fenceIndex = undefined) {
        if (!fenceIndex)
            fenceIndex = this.objectAtTile(pos, this.scene.fences);
        //Don't place if out of bounds.
        if (this.positionOutOfBounds(pos))
            return;
        if (this.tileBuildState.build && fenceIndex < 0) {
            this.scene.fences.push(new Fence(vecCopy(pos)));
        }
        else if (this.tileBuildState.remove && fenceIndex >= 0) {
            this.scene.fences.splice(fenceIndex, 1);
        }
        this.scene.fences.forEach(f => {
            f.updateNeighbors(this.scene);
        });
    }
    setGrassAtTile(pos, grassIndex = undefined) {
        if (!grassIndex)
            grassIndex = this.objectAtTile(pos, this.scene.grass);
        //Don't place if out of bounds.
        if (this.positionOutOfBounds(pos))
            return;
        if (this.tileBuildState.build && grassIndex < 0) {
            this.scene.grass.push(new Grass(vecCopy(pos)));
        }
        else if (this.tileBuildState.remove && grassIndex >= 0) {
            this.scene.grass.splice(grassIndex, 1);
        }
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
    getMouseTilePos(mousePos) {
        return {
            x: Math.floor(mousePos.x / TileSize),
            y: Math.floor(mousePos.y / TileSize)
        };
    }
    drawFlashingTile(ctx) {
        const val = this.tileBuildState.tileFlasher.next();
        let valHex = val.toString(16);
        if (valHex.length === 1)
            valHex = '0' + valHex;
        ctx.fillStyle = "#" + valHex + valHex + valHex + valHex;
        let tileX = Math.floor(this.mousePos.x / TileSize);
        let tileY = Math.floor(this.mousePos.y / TileSize);
        ctx.fillRect(tileX * TileSize, tileY * TileSize, TileSize, TileSize);
    }
    getMinimumAllowedSceneTileSize() {
        const r = {
            x: 0,
            y: 0,
            w: this.scene.minTileWidth,
            h: this.scene.minTileHeight
        };
        let tileSprites = [];
        tileSprites = tileSprites.concat(this.scene.fences, this.scene.grass);
        tileSprites.forEach(s => {
            const tp = s.tilePos;
            if (tp.x + 1 > r.w)
                r.w = tp.x + 1;
            if (tp.y + 1 > r.h)
                r.h = tp.y + 1;
        });
        return r;
    }
    setDimensions(w, h) {
        const minSize = this.getMinimumAllowedSceneTileSize();
        if (w < minSize.w)
            w = minSize.w;
        if (w > this.scene.maxTileWidth)
            w = this.scene.maxTileWidth;
        if (h < minSize.h)
            h = minSize.h;
        if (h > this.scene.maxTileHeight)
            h = this.scene.maxTileHeight;
        this.scene.width = w * TileSize;
        this.scene.height = h * TileSize;
    }
    drawLoop(canvas, ctx) {
        if (!this.inDrawLoop)
            return;
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
        this.scene.grass.forEach(g => {
            g.draw(ctx);
        });
        if (this.currentInteractMode === 1 /* InteractMode.Fence */ ||
            this.currentInteractMode === 2 /* InteractMode.Grass */) {
            this.drawFlashingTile(ctx);
        }
        let sprites = this.scene.spos;
        sprites = sprites.concat(this.scene.fences);
        sprites.sort((a, b) => {
            //Sort the grabbed spo above all other spos
            if (a instanceof Spo && b instanceof Spo) {
                const aGrab = a.state === 5 /* SpoState.Grabbed */;
                const bGrab = b.state === 5 /* SpoState.Grabbed */;
                if (aGrab && !bGrab)
                    return 1;
                if (!aGrab && bGrab)
                    return -1;
            }
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
    mouseDown_Spos(mousePos) {
        let checkGrab = true;
        this.scene.spos.forEach(s => {
            s.event_mousedown(mousePos, checkGrab);
            if (s.state === 5 /* SpoState.Grabbed */)
                checkGrab = false;
        });
    }
    mouseDown_Fence(mousePos) {
        let tilePos = this.getMouseTilePos(this.mousePos);
        const fenceIndex = this.objectAtTile(tilePos, this.scene.fences);
        //Build fence if no fence is there
        this.tileBuildState.build = fenceIndex < 0;
        this.tileBuildState.remove = fenceIndex >= 0;
        this.setFenceAtTile(tilePos, fenceIndex);
    }
    mouseDown_Grass(mousePos) {
        let tilePos = this.getMouseTilePos(this.mousePos);
        const grassIndex = this.objectAtTile(tilePos, this.scene.grass);
        //Build fence if no fence is there
        this.tileBuildState.build = grassIndex < 0;
        this.tileBuildState.remove = grassIndex >= 0;
        this.setGrassAtTile(tilePos, grassIndex);
    }
    event_mousedown(mousePos) {
        switch (this.currentInteractMode) {
            case 0 /* InteractMode.Spos */:
                this.mouseDown_Spos(mousePos);
                break;
            case 1 /* InteractMode.Fence */:
                this.mouseDown_Fence(mousePos);
                break;
            case 2 /* InteractMode.Grass */:
                this.mouseDown_Grass(mousePos);
                break;
        }
    }
    mouseMove_Fence(mousePos) {
        if (!this.tileBuildState.build && !this.tileBuildState.remove)
            return;
        const tilePos = this.getMouseTilePos(mousePos);
        const fenceIndex = this.objectAtTile(tilePos, this.scene.fences);
        this.setFenceAtTile(tilePos, fenceIndex);
    }
    mouseMove_Grass(mousePos) {
        if (!this.tileBuildState.build && !this.tileBuildState.remove)
            return;
        const tilePos = this.getMouseTilePos(mousePos);
        const grassIndex = this.objectAtTile(tilePos, this.scene.grass);
        this.setGrassAtTile(tilePos, grassIndex);
    }
    event_mousemove(mousePos) {
        this.mousePos = vecCopy(mousePos);
        this.scene.spos.forEach(s => {
            s.event_mousemove(mousePos);
        });
        switch (this.currentInteractMode) {
            case 1 /* InteractMode.Fence */:
                this.mouseMove_Fence(mousePos);
                break;
            case 2 /* InteractMode.Grass */:
                this.mouseMove_Grass(mousePos);
                break;
        }
    }
    mouseUp_Tiles(mousePos) {
        this.tileBuildState.build = false;
        this.tileBuildState.remove = false;
    }
    event_mouseup(mousePos) {
        this.scene.spos.forEach(s => {
            s.event_mouseup(mousePos);
        });
        if (this.currentInteractMode === 1 /* InteractMode.Fence */ ||
            this.currentInteractMode === 2 /* InteractMode.Grass */) {
            this.mouseUp_Tiles(mousePos);
        }
    }
    event_keydown(ev) {
    }
    event_keyup(ev) {
    }
    event_keypress(ev) {
    }
}
