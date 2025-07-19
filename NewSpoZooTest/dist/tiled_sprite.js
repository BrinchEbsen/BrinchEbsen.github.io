"use strict";
const TileSize = 64;
class TiledSprite {
    constructor(tilePos) {
        this.pos = { x: 0, y: 0 };
        this.tilePos = tilePos;
    }
    get tilePos() {
        return {
            x: Math.floor(this.pos.x / TileSize),
            y: Math.floor(this.pos.y / TileSize)
        };
    }
    set tilePos(val) {
        val.x = Math.floor(val.x);
        val.y = Math.floor(val.y);
        this.pos.x = val.x * TileSize;
        this.pos.y = val.y * TileSize;
    }
    get anchorPos() {
        throw new Error("anchorPos not implemented in base class TiledSprite.");
    }
    set anchorPos(val) {
        throw new Error("anchorPos not implemented in base class TiledSprite.");
    }
    draw(ctx) {
        throw new Error("Attempted to draw instance of base class TiledSprite.");
    }
}
