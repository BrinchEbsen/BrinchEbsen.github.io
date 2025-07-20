class Grass extends TiledSprite {
    draw(ctx: CanvasRenderingContext2D): void {
        const frame = MiscFrames.get("grass")!;

        ctx.drawImage(frame, this.pos.x, this.pos.y);

        //ctx.fillStyle = "#36d553ff";
        //ctx.fillRect(this.pos.x, this.pos.y, TileSize, TileSize);
    }
}