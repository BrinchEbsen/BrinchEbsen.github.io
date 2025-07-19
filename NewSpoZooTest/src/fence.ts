type FenceNeighbors = {
    U: boolean,
    R: boolean,
    D: boolean,
    L: boolean
};

type CollisionResult = {
    hit: boolean,
    newPos: Vec
};

const FenceBaseCollisionRect: Rect = {
    x: 16,
    y: 32,
    w: 32,
    h: 32
};

const FenceBaseCollisionCenter: Vec = {
    x: FenceBaseCollisionRect.x + (FenceBaseCollisionRect.w / 2),
    y: FenceBaseCollisionRect.y + (FenceBaseCollisionRect.h / 2)
};

const FenceBaseCollisionRadius = FenceBaseCollisionRect.w / 2;

class Fence extends TiledSprite {
    neighbors: FenceNeighbors = {
        U: false,
        R: false,
        D: false,
        L: false
    };

    constructor(tilePos: Vec) {
        super(tilePos);
    }

    get anchorPos(): Vec {
        return {
            x: this.pos.x + 32,
            y: this.pos.y + 58
        };
    }

    set anchorPos(val: Vec) {
        this.pos.x = val.x - 32;
        this.pos.y = val.y - 58;
    }

    /**
     * Test collision with the fence.
     * @param pos Position to test.
     * @returns A result with the new position after collision.
     */
    testCollision(pos: Vec): CollisionResult {
        //Set up the result with the case that nothing happened.
        const result: CollisionResult = {
            hit: false, newPos: vecCopy(pos)
        };

        //Relative position compared to the fence's origin
        const relPos = vecFromTo(this.pos, pos);

        //Stop immediately if not within bounds of fence
        if (relPos.x < 0 || relPos.x > TileSize ||
            relPos.y < 0 || relPos.y > TileSize
        ) {
            return result;
        }

        //Keep a copy of the relative position for later
        const origRelPos = vecCopy(relPos);

        //Shorter names for these variables :)
        const base = FenceBaseCollisionRect;
        const center = FenceBaseCollisionCenter;

        //Direction from the base's center
        let pushDir = vecFromTo(center, relPos);
        //Distance from center to position
        const posDistToCenter = vecLength(pushDir);
        //How far outside the base the position is
        const posDistToCenterDiff = posDistToCenter - FenceBaseCollisionRadius;
        //Whether the position is inside the fence
        const insideBase = posDistToCenterDiff < 0;

        const leftOfCenter = relPos.x < center.x;
        const aboveCenter  = relPos.y < center.y;

        //Try performing circular base collision first, depending on the neighboring walls.
        if (insideBase) {
            if (
                //No neighbor walls covering:
                !(leftOfCenter && this.neighbors.L) && //Left side if left of center
                !(!leftOfCenter && this.neighbors.R) && //Right side if right of center
                !(aboveCenter && this.neighbors.U) && //Upper side if above center
                !(!aboveCenter && this.neighbors.D) //Lower side if below center
            ) {
                //Now we know the position is inside the base, and not covered by any neighboring wall.

                //Make a vector for how the position should be pushed to get out of the base.
                pushDir = vecNormalize(pushDir, Math.abs(posDistToCenterDiff));

                //Report that collision is done, add push.
                result.hit = true;
                relPos.x += pushDir.x;
                relPos.y += pushDir.y;
            }
        }
        
        //If the base didn't move the position, we now test the neighboring walls.
        //(either purely vertical or horizontal pushing)
        if (!result.hit) {
            //Horizontal walls (only adding comments to this one)
            if (this.neighbors.L || this.neighbors.R) {
                //Use the base for the vertical components of the wall
                const wallRect: Rect = {
                    x: 0,
                    y: base.y,
                    w: 0,
                    h: base.h
                };

                //Adjust wall rectangle based on the left/right neighbors

                if (this.neighbors.L) {
                    wallRect.x = 0;
                } else {
                    wallRect.x = center.x;
                }

                if (this.neighbors.R) {
                    wallRect.w = TileSize - wallRect.x;
                } else {
                    wallRect.w = center.x;
                }

                //If the position is within the wall, perform a push.
                if (
                    (relPos.x >= wallRect.x) &&
                    (relPos.x <= wallRect.x + wallRect.w) &&
                    (relPos.y > wallRect.y) &&
                    (relPos.y < wallRect.y + wallRect.h)
                ) {
                    //Push either up or down.
                    if (aboveCenter) {
                        relPos.y = wallRect.y;
                    } else {
                        relPos.y = wallRect.y + wallRect.h;
                    }

                    result.hit = true;
                }
            }

            //It's fine if both horizontal and vertical walls push the position.
            //The pushes get combined and everything works out.

            //Vertical walls (same as horizontal, but... vertical)
            if (this.neighbors.U || this.neighbors.D) {
                const wallRect: Rect = {
                    x: base.x,
                    y: 0,
                    w: base.w,
                    h: 0
                };

                if (this.neighbors.U) {
                    wallRect.y = 0;
                } else {
                    wallRect.y = center.y;
                }

                if (this.neighbors.D) {
                    wallRect.h = TileSize - wallRect.y;
                } else {
                    wallRect.h = center.y;
                }

                if (
                    (relPos.x > wallRect.x) &&
                    (relPos.x < wallRect.x + wallRect.w) &&
                    (relPos.y >= wallRect.y) &&
                    (relPos.y <= wallRect.y + wallRect.h)
                ) {
                    if (leftOfCenter) {
                        relPos.x = wallRect.x;
                    } else {
                        relPos.x = wallRect.x + wallRect.w;
                    }

                    result.hit = true;
                }
            }
        }

        //If the position was moved, compute new absolute position for the result.
        if (result.hit) {
            const moveVec = vecFromTo(origRelPos, relPos);
            result.newPos = vecAdd(result.newPos, moveVec);
        }

        return result;
    }

    updateNeighbors(scene: SpoZooScene) {
        this.neighbors.U = false;
        this.neighbors.R = false;
        this.neighbors.D = false;
        this.neighbors.L = false;

        scene.fences.forEach(f => {
            if (f === this) return;

            const thisTile = this.tilePos;
            const fTile = f.tilePos;

            if (fTile.x == thisTile.x) {
                if (fTile.y == (thisTile.y-1)) {
                    this.neighbors.U = true;
                } else if (fTile.y == (thisTile.y+1)) {
                    this.neighbors.D = true;
                }
            } else if (fTile.y == thisTile.y) {
                if (fTile.x == (thisTile.x+1)) {
                    this.neighbors.R = true;
                } else if (fTile.x == (thisTile.x-1)) {
                    this.neighbors.L = true;
                }
            }
        });
    }

    getFrameName(): string {
        let name = "fence_";
        
        if (this.neighbors.U) name += "U";
        if (this.neighbors.R) name += "R";
        if (this.neighbors.D) name += "D";
        if (this.neighbors.L) name += "L";

        return name;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const name = this.getFrameName();
        const frame = FenceFrames.get(name);

        if (!frame)
            throw new Error(`Could not find fence frame ${name}!`);

        ctx.drawImage(frame, Math.floor(this.pos.x), Math.floor(this.pos.y));
    }
}