const FenceTileSize = 64;

type FenceNeighbors = {
    U: boolean,
    R: boolean,
    D: boolean,
    L: boolean
};

class Fence implements Sprite {
    pos: Vec = {x: 0, y: 0};

    neighbors: FenceNeighbors = {
        U: false,
        R: false,
        D: false,
        L: false
    } 

    constructor(tilePos: Vec) {
        this.tilePos = tilePos;
    }

    get tilePos(): Vec {
        return {
            x: Math.floor(this.pos.x / FenceTileSize),
            y: Math.floor(this.pos.y / FenceTileSize)
        };
    }

    set tilePos(val: Vec) {
        val.x = Math.floor(val.x);
        val.y = Math.floor(val.y);

        this.pos.x = val.x * FenceTileSize;
        this.pos.y = val.y * FenceTileSize;
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