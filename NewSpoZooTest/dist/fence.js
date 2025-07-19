"use strict";
const FenceBaseCollisionRect = {
    x: 16,
    y: 32,
    w: 32,
    h: 32
};
const FenceBaseCollisionCenter = {
    x: FenceBaseCollisionRect.x + (FenceBaseCollisionRect.w / 2),
    y: FenceBaseCollisionRect.y + (FenceBaseCollisionRect.h / 2)
};
const FenceBaseCollisionRadius = FenceBaseCollisionRect.w / 2;
class Fence extends TiledSprite {
    constructor(tilePos) {
        super(tilePos);
        this.neighbors = {
            U: false,
            R: false,
            D: false,
            L: false
        };
    }
    get anchorPos() {
        return {
            x: this.pos.x + 32,
            y: this.pos.y + 58
        };
    }
    set anchorPos(val) {
        this.pos.x = val.x - 32;
        this.pos.y = val.y - 58;
    }
    testCollision(pos) {
        const result = {
            hit: false, newPos: vecCopy(pos)
        };
        const relPos = vecFromTo(this.pos, pos);
        if (relPos.x < 0 || relPos.x > TileSize ||
            relPos.y < 0 || relPos.y > TileSize) {
            return result;
        }
        const origRelPos = vecCopy(relPos);
        const base = FenceBaseCollisionRect;
        const center = FenceBaseCollisionCenter;
        let pushDir = vecFromTo(center, relPos);
        const posDistToCenter = vecLength(pushDir);
        const posDistToCenterDiff = posDistToCenter - FenceBaseCollisionRadius;
        const insideBase = posDistToCenterDiff < 0;
        const leftOfCenter = relPos.x < center.x;
        const aboveCenter = relPos.y < center.y;
        if (insideBase) {
            if (
            //No neighbor walls covering:
            !(leftOfCenter && this.neighbors.L) && //Left side
                !(!leftOfCenter && this.neighbors.R) && //Right side
                !(aboveCenter && this.neighbors.U) && //Upper side
                !(!aboveCenter && this.neighbors.D) //Lower side
            ) {
                pushDir = vecNormalize(pushDir, Math.abs(posDistToCenterDiff));
                result.hit = true;
                relPos.x += pushDir.x;
                relPos.y += pushDir.y;
            }
        }
        //If the base didn't move the Spo, we now treat it like walls
        //(either purely vertical or horizontal pushing)
        if (!result.hit) {
            //Horizontal walls
            if (this.neighbors.L || this.neighbors.R) {
                const wallRect = {
                    x: 0,
                    y: base.y,
                    w: 0,
                    h: base.h
                };
                if (this.neighbors.L) {
                    wallRect.x = 0;
                }
                else {
                    wallRect.x = center.x;
                }
                if (this.neighbors.R) {
                    wallRect.w = TileSize - wallRect.x;
                }
                else {
                    wallRect.w = center.x;
                }
                if ((relPos.x >= wallRect.x) &&
                    (relPos.x <= wallRect.x + wallRect.w) &&
                    (relPos.y > wallRect.y) &&
                    (relPos.y < wallRect.y + wallRect.h)) {
                    if (aboveCenter) {
                        relPos.y = wallRect.y;
                    }
                    else {
                        relPos.y = wallRect.y + wallRect.h;
                    }
                    result.hit = true;
                }
            }
            //Vertical walls
            if (this.neighbors.U || this.neighbors.D) {
                const wallRect = {
                    x: base.x,
                    y: 0,
                    w: base.w,
                    h: 0
                };
                if (this.neighbors.U) {
                    wallRect.y = 0;
                }
                else {
                    wallRect.y = center.y;
                }
                if (this.neighbors.D) {
                    wallRect.h = TileSize - wallRect.y;
                }
                else {
                    wallRect.h = center.y;
                }
                if ((relPos.x > wallRect.x) &&
                    (relPos.x < wallRect.x + wallRect.w) &&
                    (relPos.y >= wallRect.y) &&
                    (relPos.y <= wallRect.y + wallRect.h)) {
                    if (leftOfCenter) {
                        relPos.x = wallRect.x;
                    }
                    else {
                        relPos.x = wallRect.x + wallRect.w;
                    }
                    result.hit = true;
                }
            }
        }
        if (result.hit) {
            const moveVec = vecFromTo(origRelPos, relPos);
            result.newPos = vecAdd(result.newPos, moveVec);
        }
        return result;
    }
    updateNeighbors(scene) {
        this.neighbors.U = false;
        this.neighbors.R = false;
        this.neighbors.D = false;
        this.neighbors.L = false;
        scene.fences.forEach(f => {
            if (f === this)
                return;
            const thisTile = this.tilePos;
            const fTile = f.tilePos;
            if (fTile.x == thisTile.x) {
                if (fTile.y == (thisTile.y - 1)) {
                    this.neighbors.U = true;
                }
                else if (fTile.y == (thisTile.y + 1)) {
                    this.neighbors.D = true;
                }
            }
            else if (fTile.y == thisTile.y) {
                if (fTile.x == (thisTile.x + 1)) {
                    this.neighbors.R = true;
                }
                else if (fTile.x == (thisTile.x - 1)) {
                    this.neighbors.L = true;
                }
            }
        });
    }
    getFrameName() {
        let name = "fence_";
        if (this.neighbors.U)
            name += "U";
        if (this.neighbors.R)
            name += "R";
        if (this.neighbors.D)
            name += "D";
        if (this.neighbors.L)
            name += "L";
        return name;
    }
    draw(ctx) {
        const name = this.getFrameName();
        const frame = FenceFrames.get(name);
        if (!frame)
            throw new Error(`Could not find fence frame ${name}!`);
        ctx.drawImage(frame, Math.floor(this.pos.x), Math.floor(this.pos.y));
    }
}
