"use strict";
;
const SpoZooMinTileWidth = 4;
const SpoZooMinTileHeight = 4;
const CarrotSpawnChance = 0.003;
class SpoZoo {
    constructor(fps = 60) {
        this.fps = 0;
        this.frameInterval = 0;
        this.drawMsCurr = 0;
        this.drawMsLast = 0;
        this.spoLimit = 1000;
        this.inDrawLoop = false;
        this.setFps(fps);
        this.currentInteractMode = 0;
        this.scene = {
            width: SpoZooMinTileWidth * TileSize,
            height: SpoZooMinTileHeight * TileSize,
            minTileWidth: SpoZooMinTileWidth,
            minTileHeight: SpoZooMinTileHeight,
            maxTileWidth: 100,
            maxTileHeight: 100,
            removeSpos: false,
            spos: [],
            carrots: [],
            fences: [],
            grass: [],
            particles: new Map()
        };
        this.setDimensions(this.scene.width, this.scene.height);
        this.createParticleSystems();
        this.spoDensityTarget = 0.4;
        this.tileBuildState = {
            build: false,
            remove: false,
            tileFlasher: new Flasher(0x10, 0x80, 6)
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
        this.scene.particles.set(2, new ParticleSys([MiscFrames.get("sweat")], {
            loop: true,
            lifespan: 8,
            startFadeOut: 0,
            size: 0.5
        }));
        this.scene.particles.set(3, new ParticleSys([MiscFrames.get("whitecircle")], {
            loop: true,
            lifespan: 8
        }));
    }
    spawnGenericParticleEffect(pos, range, speed) {
        const sys = this.scene.particles.get(3);
        if (sys === undefined)
            return;
        const oneEighthAng = Math.PI / 4;
        for (let i = 0; i < 8; i++) {
            const ang = oneEighthAng * i - Math.PI;
            const vecAng = vecFromAngle(ang);
            const vecSpd = vecNormalize(vecAng, speed);
            const vecPos = vecAdd(pos, vecNormalize(vecAng, range));
            sys.addParticle(vecPos, {
                flyInDirection: {
                    vel: vecSpd
                }
            });
        }
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
        this.scene.spos.push(spo);
    }
    spawnCarrot() {
        const limit = (this.sceneTileWidth * this.sceneTileHeight) / 4;
        if (this.scene.carrots.length >= limit)
            return;
        const pos = {
            x: randomFromTo(0 + TileSize / 2, this.scene.width - TileSize / 2),
            y: randomFromTo(0 + TileSize / 2, this.scene.height - TileSize / 2)
        };
        this.scene.carrots.push(new Carrot(pos, CarrotState.InGround));
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
                i--;
            }
        }
    }
    purgeCarrots() {
        for (let i = 0; i < this.scene.carrots.length; i++) {
            const carrot = this.scene.carrots[i];
            if (carrot.requestDelete) {
                this.scene.carrots.splice(i, 1);
                i--;
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
        canvas.width = this.scene.width;
        canvas.height = this.scene.height;
    }
    getTilePos(vec) {
        return {
            x: Math.floor(vec.x / TileSize),
            y: Math.floor(vec.y / TileSize)
        };
    }
    drawFlashingTile(ctx) {
        const val = this.tileBuildState.tileFlasher.next();
        let valHex = val.toString(16);
        if (valHex.length === 1)
            valHex = '0' + valHex;
        ctx.fillStyle = "#FFFFFF" + valHex;
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
    drawBackground(ctx) {
        if (this.backgroundDrawPattern === undefined) {
            const frame = MiscFrames.get("sand");
            if (frame !== undefined) {
                const pat = ctx.createPattern(frame, "repeat");
                if (pat !== null)
                    this.backgroundDrawPattern = pat;
            }
        }
        if (this.backgroundDrawPattern !== undefined) {
            this.backgroundDrawPattern
                .setTransform(new DOMMatrix([1, 0, 0, 1, 0, 0]));
            ctx.fillStyle = this.backgroundDrawPattern;
            ctx.fillRect(0, 0, this.scene.width, this.scene.height);
        }
    }
    drawLoop(canvas, ctx) {
        if (!this.inDrawLoop)
            return;
        this.drawMsCurr = window.performance.now();
        if ((this.drawMsCurr - this.drawMsLast) > this.frameInterval) {
            this.drawMsLast = this.drawMsCurr;
            this.fitCanvas(canvas);
            this.testAdjustSpoAmount();
            this.purgeSpos();
            this.purgeCarrots();
            if (randomBool(CarrotSpawnChance))
                this.spawnCarrot();
            this.scene.spos.forEach(s => {
                s.step(this.scene);
            });
            this.scene.carrots.forEach(c => {
                c.step(this.scene);
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
        this.drawBackground(ctx);
        this.scene.grass.forEach(g => {
            g.draw(ctx);
        });
        if (this.currentInteractMode === 1 ||
            this.currentInteractMode === 2) {
            this.drawFlashingTile(ctx);
        }
        let sprites = this.scene.spos;
        sprites = sprites.concat(this.scene.fences, this.scene.carrots);
        sprites.sort((a, b) => {
            if (a instanceof Spo && b instanceof Spo) {
                const aGrab = a.state === 5;
                const bGrab = b.state === 5;
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
    mouseDown_Grab(mousePos) {
        let checkGrab = true;
        let spookSpos = true;
        this.scene.carrots.forEach(c => {
            const prevState = c.state;
            c.event_mouseDown(mousePos, this, checkGrab);
            if (prevState != c.state) {
                checkGrab = false;
                spookSpos = false;
            }
        });
        this.scene.spos.forEach(s => {
            s.event_mousedown(mousePos, checkGrab, spookSpos);
            if (s.state === 5)
                checkGrab = false;
        });
    }
    mouseDown_Fence(mousePos) {
        let tilePos = this.getTilePos(this.mousePos);
        const fenceIndex = this.objectAtTile(tilePos, this.scene.fences);
        this.tileBuildState.build = fenceIndex < 0;
        this.tileBuildState.remove = fenceIndex >= 0;
        this.setFenceAtTile(tilePos, fenceIndex);
    }
    mouseDown_Grass(mousePos) {
        let tilePos = this.getTilePos(this.mousePos);
        const grassIndex = this.objectAtTile(tilePos, this.scene.grass);
        this.tileBuildState.build = grassIndex < 0;
        this.tileBuildState.remove = grassIndex >= 0;
        this.setGrassAtTile(tilePos, grassIndex);
    }
    event_mousedown(mousePos) {
        switch (this.currentInteractMode) {
            case 0:
                this.mouseDown_Grab(mousePos);
                break;
            case 1:
                this.mouseDown_Fence(mousePos);
                break;
            case 2:
                this.mouseDown_Grass(mousePos);
                break;
        }
    }
    mouseMove_Fence(mousePos) {
        if (!this.tileBuildState.build && !this.tileBuildState.remove)
            return;
        const tilePos = this.getTilePos(mousePos);
        const fenceIndex = this.objectAtTile(tilePos, this.scene.fences);
        this.setFenceAtTile(tilePos, fenceIndex);
    }
    mouseMove_Grass(mousePos) {
        if (!this.tileBuildState.build && !this.tileBuildState.remove)
            return;
        const tilePos = this.getTilePos(mousePos);
        const grassIndex = this.objectAtTile(tilePos, this.scene.grass);
        this.setGrassAtTile(tilePos, grassIndex);
    }
    event_mousemove(mousePos) {
        this.mousePos = vecCopy(mousePos);
        this.scene.carrots.forEach(c => {
            c.event_mouseMove(mousePos);
        });
        this.scene.spos.forEach(s => {
            s.event_mousemove(mousePos);
        });
        switch (this.currentInteractMode) {
            case 1:
                this.mouseMove_Fence(mousePos);
                break;
            case 2:
                this.mouseMove_Grass(mousePos);
                break;
        }
    }
    mouseUp_Tiles(mousePos) {
        this.tileBuildState.build = false;
        this.tileBuildState.remove = false;
    }
    event_mouseup(mousePos) {
        this.scene.carrots.forEach(c => {
            c.event_mouseUp(mousePos, this);
        });
        this.scene.spos.forEach(s => {
            s.event_mouseup(mousePos);
        });
        if (this.currentInteractMode === 1 ||
            this.currentInteractMode === 2) {
            this.mouseUp_Tiles(mousePos);
        }
    }
    event_keydown(ev) {
    }
    event_keyup(ev) {
    }
    event_keypress(ev) {
    }
    createSaveData() {
        const saveData = createEmptySave();
        saveData.sceneTileWidth = this.sceneTileWidth;
        saveData.sceneTileHeight = this.sceneTileHeight;
        for (let i = 0; i < this.scene.fences.length; i++) {
            saveData.fencePositions.push(vecCopy(this.scene.fences[i].tilePos));
        }
        for (let i = 0; i < this.scene.grass.length; i++) {
            saveData.grassPositions.push(vecCopy(this.scene.grass[i].tilePos));
        }
        this.scene.spos.forEach(s => {
            const tilePos = this.getTilePos(s.anchorPos);
            for (let i = 0; i < saveData.grassPositions.length; i++) {
                const grassPos = saveData.grassPositions[i];
                if (vecEquals(tilePos, grassPos)) {
                    saveData.spos.push({
                        pos: vecCopy(s.pos),
                        type: s.getType()
                    });
                    break;
                }
            }
        });
        return saveData;
    }
    loadSaveData(saveData) {
        this.scene.spos = [];
        this.scene.carrots = [];
        this.scene.fences = [];
        this.scene.grass = [];
        saveData.spos.forEach(s => {
            const addSpo = new Spo(vecCopy(s.pos));
            addSpo.setType(s.type);
            addSpo.makeStand();
            this.scene.spos.push(addSpo);
        });
        saveData.fencePositions.forEach(f => {
            this.scene.fences.push(new Fence(vecCopy(f)));
        });
        this.scene.fences.forEach(f => {
            f.updateNeighbors(this.scene);
        });
        saveData.grassPositions.forEach(g => {
            this.scene.grass.push(new Grass(vecCopy(g)));
        });
        const minSize = this.getMinimumAllowedSceneTileSize();
        this.scene.width = Math.max(minSize.w, saveData.sceneTileWidth) * TileSize;
        this.scene.height = Math.max(minSize.h, saveData.sceneTileHeight) * TileSize;
    }
}
