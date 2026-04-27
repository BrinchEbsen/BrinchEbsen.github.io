interface Sprite {
    pos : Vec;

    get anchorPos() : Vec;
    set anchorPos(val: Vec);

    draw : (ctx : CanvasRenderingContext2D) => void;
}