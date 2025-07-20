"use strict";
class Grass extends TiledSprite {
    draw(ctx) {
        ctx.fillStyle = "#00ba22ff";
        ctx.fillRect(this.pos.x, this.pos.y, TileSize, TileSize);
    }
}
