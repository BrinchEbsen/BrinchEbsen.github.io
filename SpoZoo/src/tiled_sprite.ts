const TileSize = 64;

abstract class TiledSprite implements Sprite {
    pos: Vec = {x: 0, y: 0};

    constructor(tilePos: Vec) {
        this.tilePos = tilePos;
    }

    get tilePos(): Vec {
        return {
            x: Math.floor(this.pos.x / TileSize),
            y: Math.floor(this.pos.y / TileSize)
        };
    }

    set tilePos(val: Vec) {
        val.x = Math.floor(val.x);
        val.y = Math.floor(val.y);

        this.pos.x = val.x * TileSize;
        this.pos.y = val.y * TileSize;
    }

    get anchorPos(): Vec {
        throw new Error("anchorPos not implemented in base class TiledSprite.");
    }

    set anchorPos(val: Vec) {
        throw new Error("anchorPos not implemented in base class TiledSprite.");
    }

    draw(ctx: CanvasRenderingContext2D): void {
        throw new Error("Attempted to draw instance of base class TiledSprite.");
    }

}