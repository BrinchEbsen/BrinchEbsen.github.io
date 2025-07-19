"use strict";
class SpoZoo {
    constructor(width = window.innerWidth, height = window.innerHeight, fps = 60) {
        this.fps = 0;
        this.frameInterval = 0;
        this.drawMsCurr = 0;
        this.drawMsLast = 0;
        this.spoLimit = 1000;
        this.inDrawLoop = false;
        this.setFps(fps);
        this.currentInteractMode = 0 /* InteractMode.Spos */;
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
            mousePos: { x: 0, y: 0 },
            tileFlasher: new Flasher(0x10, 0x60, 6)
        };
        //TEST
        this.scene.fences.push(new Fence({ x: 6, y: 4 }));
        this.scene.fences.push(new Fence({ x: 7, y: 4 }));
        this.scene.fences.push(new Fence({ x: 7, y: 5 }));
        this.scene.fences.forEach(f => {
            f.updateNeighbors(this.scene);
        });
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
            this.addSpo();
        if (deviation < 0) {
            const numDespawn = this.numSposSetForDespawn();
            const numToDespawn = Math.abs(deviation) - numDespawn;
            if (numToDespawn > 0)
                this.setRandomSpoForDespawn();
        }
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
    fenceAtTile(pos) {
        for (let i = 0; i < this.scene.fences.length; i++) {
            const tilePos = this.scene.fences[i].tilePos;
            if (tilePos.x == pos.x && tilePos.y == pos.y) {
                return i;
            }
        }
        return -1;
    }
    setFenceAtTile(pos, fenceIndex = undefined) {
        if (!fenceIndex)
            fenceIndex = this.fenceAtTile(pos);
        if (this.fenceBuildState.build && fenceIndex < 0) {
            this.scene.fences.push(new Fence(pos));
        }
        else if (this.fenceBuildState.remove && fenceIndex >= 0) {
            this.scene.fences.splice(fenceIndex, 1);
        }
        this.scene.fences.forEach(f => {
            f.updateNeighbors(this.scene);
        });
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
        this.scene.width = Math.max(window.innerWidth, this.scene.minWidth);
        this.scene.height = Math.max(window.innerHeight, this.scene.minHeight);
        if ((this.scene.width > window.innerWidth) ||
            (this.scene.height > window.innerHeight))
            setEnableScroll(true);
        else
            setEnableScroll(false);
        canvas.width = this.scene.width;
        canvas.height = this.scene.height;
    }
    drawFenceTile(ctx) {
        const val = this.fenceBuildState.tileFlasher.next();
        let valHex = val.toString(16);
        if (valHex.length === 1)
            valHex = '0' + valHex;
        ctx.fillStyle = "#" + valHex + valHex + valHex;
        let tileX = Math.floor(this.fenceBuildState.mousePos.x / FenceTileSize);
        let tileY = Math.floor(this.fenceBuildState.mousePos.y / FenceTileSize);
        ctx.fillRect(tileX * FenceTileSize, tileY * FenceTileSize, FenceTileSize, FenceTileSize);
    }
    drawLoop(canvas, ctx) {
        if (!this.inDrawLoop)
            return;
        this.drawMsCurr = window.performance.now();
        if ((this.drawMsCurr - this.drawMsLast) > this.frameInterval) {
            this.drawMsLast = this.drawMsCurr;
            this.fitCanvas(canvas);
            if (randomBool(0.25))
                this.testAdjustSpoAmount();
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
    drawFrame(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.scene.width, this.scene.height);
        if (this.currentInteractMode === 1 /* InteractMode.Fence */)
            this.drawFenceTile(ctx);
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
        this.scene.sparkles.draw(ctx);
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
        this.fenceBuildState.mousePos = vecCopy(mousePos);
        let tileX = Math.floor(this.fenceBuildState.mousePos.x / FenceTileSize);
        let tileY = Math.floor(this.fenceBuildState.mousePos.y / FenceTileSize);
        const fenceIndex = this.fenceAtTile({ x: tileX, y: tileY });
        //Build fence if no fence is there
        this.fenceBuildState.build = fenceIndex < 0;
        this.fenceBuildState.remove = fenceIndex >= 0;
        this.setFenceAtTile({ x: tileX, y: tileY }, fenceIndex);
    }
    event_mousedown(mousePos) {
        switch (this.currentInteractMode) {
            case 0 /* InteractMode.Spos */:
                this.mouseDown_Spos(mousePos);
                break;
            case 1 /* InteractMode.Fence */:
                this.mouseDown_Fence(mousePos);
                break;
        }
    }
    mouseMove_fence(mousePos) {
        this.fenceBuildState.mousePos = vecCopy(mousePos);
        let tileX = Math.floor(this.fenceBuildState.mousePos.x / FenceTileSize);
        let tileY = Math.floor(this.fenceBuildState.mousePos.y / FenceTileSize);
        const fenceIndex = this.fenceAtTile({ x: tileX, y: tileY });
        this.setFenceAtTile({ x: tileX, y: tileY }, fenceIndex);
    }
    event_mousemove(mousePos) {
        this.scene.spos.forEach(s => {
            s.event_mousemove(mousePos);
        });
        this.mouseMove_fence(mousePos);
    }
    mouseUp_fence(mousePos) {
        this.fenceBuildState.build = false;
        this.fenceBuildState.remove = false;
    }
    event_mouseup(mousePos) {
        this.scene.spos.forEach(s => {
            s.event_mouseup(mousePos);
        });
        if (this.currentInteractMode === 1 /* InteractMode.Fence */) {
            this.mouseUp_fence(mousePos);
        }
    }
    event_keydown(ev) {
    }
    event_keyup(ev) {
    }
    event_keypress(ev) {
        const key = ev.key;
        switch (key) {
            case "s":
                this.currentInteractMode = 0 /* InteractMode.Spos */;
                break;
            case "f":
                this.currentInteractMode = 1 /* InteractMode.Fence */;
                break;
        }
    }
}
