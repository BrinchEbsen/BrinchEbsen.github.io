"use strict";
class Grass extends TiledSprite {
    draw(ctx) {
        const frame = MiscFrames.get("grass");
        ctx.drawImage(frame, this.pos.x, this.pos.y);
    }
}
