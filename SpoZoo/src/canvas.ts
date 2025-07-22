/**
 * The canvas.
 */
const CANVAS : HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
/**
 * The 2D rendering context of the canvas.
 */
const CTX : CanvasRenderingContext2D = CANVAS.getContext("2d", { alpha: false })!;

/**
 * Whether the mouse is currently inside the canvas.
 */
let CanvasMouseInside = false;
/**
 * The mouse position relative to the canvas.
 */
const CanvasMousePos : Vec = {x: 0, y: 0};

/**
 * Record and update the relative canvas mouse position.
 * @param ev The mouse event.
 */
function updateCanvasMousePos(ev : MouseEvent) : void {
    //Get the client position and dimensions of the canvas.
    const canvasRect : DOMRect = CANVAS.getBoundingClientRect();
    
    //Subtract from client mouse position to get relative position.
    CanvasMousePos.x = ev.clientX - canvasRect.left;
    CanvasMousePos.y = ev.clientY - canvasRect.top;

    CanvasMouseInside = (
        (CanvasMousePos.x >= 0) && (CanvasMousePos.x <= CANVAS.width) &&
        (CanvasMousePos.y >= 0) && (CanvasMousePos.y <= CANVAS.height)
    );
}

/**
 * Set whether to enable/disable the scroll bars on the page.
 * @param enable True if enable, false if disable.
 */
function setEnableScroll(enable : boolean) : void {
    //Scrolling is disabled by adding a css class to the document.

    const scrollDisabled = document.body.classList.contains("disableScroll");

    if (!enable && !scrollDisabled) {
        document.body.classList.add("disableScroll");
    } else if (enable && scrollDisabled) {
        document.body.classList.remove("disableScroll");
    }
}