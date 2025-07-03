class Fence {
    constructor(tileX, tileY) {
        this.tileX = tileX;
        this.tileY = tileY;

        this.center = {x: 32, y: 58};
        this.collisionCenter = {x: 32, y: 48};

        this.neighbors = {
            U: false,
            R: false,
            D: false,
            L: false
        };
    }

    get x() {
        return this.tileX * fenceTileSize;
    }
    set x(val) {
        this.tileX = Math.floor(val / fenceTileSize);
    }
    get y() {
        return this.tileY * fenceTileSize;
    }
    set y(val) {
        this.tileY = Math.floor(val / fenceTileSize);
    }

    updateNeighbors() {
        this.neighbors.U = false;
        this.neighbors.R = false;
        this.neighbors.D = false;
        this.neighbors.L = false;

        fences.forEach(f => {
            if (f.tileX == this.tileX) {
                if (f.tileY == (this.tileY-1)) {
                    this.neighbors.U = true;
                } else if (f.tileY == (this.tileY+1)) {
                    this.neighbors.D = true;
                }
            } else if (f.tileY == this.tileY) {
                if (f.tileX == (this.tileX+1)) {
                    this.neighbors.R = true;
                } else if (f.tileX == (this.tileX-1)) {
                    this.neighbors.L = true;
                }
            }
        });
    }
    
    checkCollide(x, y) {
        let relX = x - this.x;
        let relY = y - this.y;

        const status = { hit: false, x: x, y: y };

        //Check if completely out of bounds
        if (relX < 0 || relX > 64 ||
            relY < 0 || relY > 64) {
            return status;
        }

        const origRelX = relX;
        const origRelY = relY;

        const leftOfBase = relX < 16;
        const rightOfBase = relX > 48;
        const aboveBase = relY < 32;
        const belowBase = relY > 64;
        
        const insideBase = !leftOfBase && !rightOfBase && !aboveBase && !belowBase;

        const pushDir = closestCardinalDirection(
            this.collisionCenter.x, this.collisionCenter.y, relX, relY);

        //Do collision in the base of the pole.
        //Only do a push if there's no neighbor fence in the way.
        if (insideBase) {
            if (pushDir[0] == -1 && !this.neighbors.L) {
                relX = 16;
                status.hit = true;
            } else if (pushDir[0] == 1 && !this.neighbors.R) {
                relX = 48;
                status.hit = true;
            }
            if (pushDir[1] == -1 && !this.neighbors.U) {
                relY = 32;
                status.hit = true;
            } else if (pushDir[1] == 1 && !this.neighbors.D) {
                relY = 64;
                status.hit = true;
            }
        }

        //If the base didn't move the Spo, we now treat it like walls
        //(either purely vertical or horizontal pushing)
        if (!status.hit) {
            if (this.neighbors.L || this.neighbors.R) {
                const aboveCenter  = relY < this.collisionCenter.y;

                let leftEdge  = this.neighbors.L ? 0  : 16;
                let rightEdge = this.neighbors.R ? 64 : 48;

                if (relX <= rightEdge && relX > leftEdge &&
                    !aboveBase && !belowBase
                ) {
                    if (aboveCenter) {
                        relY = 32;
                    } else {
                        relY = 64;
                    }
                    status.hit = true;
                }
            }

            if (this.neighbors.U || this.neighbors.D) {
                const leftOfCenter = relX < this.collisionCenter.x;

                let upperEdge = this.neighbors.U ? 0  : 32;
                let lowerEdge = 64;

                if (relY <= lowerEdge && relY > upperEdge &&
                    !leftOfBase && !rightOfBase
                ) {
                    if (leftOfCenter) {
                        relX = 16;
                    } else {
                        relX = 48;
                    }
                    status.hit = true;
                }
            }
        }

        if (status.hit) {
            const moveX = relX - origRelX;
            const moveY = relY - origRelY;

            status.x += moveX;
            status.y += moveY;
        }

        return status;
    }

    getFrameName() {
        let name = "fence_";
        
        if (this.neighbors.U) name += "U";
        if (this.neighbors.R) name += "R";
        if (this.neighbors.D) name += "D";
        if (this.neighbors.L) name += "L";

        return name;
    }

    draw() {
        const name = this.getFrameName();
        const frame = fenceFrames[name];

        if (frame == null) {
            console.error("Fence frame "+name+" not found!");
            return;
        }

        ctx.drawImage(frame, Math.floor(this.x), Math.floor(this.y));
    }
}