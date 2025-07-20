class Grass extends TiledSprite {
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#00ba22ff";
        ctx.fillRect(this.pos.x, this.pos.y, TileSize, TileSize);
    }
}