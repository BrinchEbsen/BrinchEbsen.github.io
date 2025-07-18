interface Sprite {
    pos : Vec;

    get anchorPos() : Vec;

    draw : (ctx : CanvasRenderingContext2D) => void;
}