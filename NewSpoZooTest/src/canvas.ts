const CANVAS : HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const CTX : CanvasRenderingContext2D = CANVAS.getContext("2d", { alpha: false })!;

let CanvasMouseInside = false;
const CanvasMousePos : Vec = {x: 0, y: 0};

function updateCanvasMousePos(ev : MouseEvent) : void {
    const canvasRect : DOMRect = CANVAS.getBoundingClientRect();
    
    CanvasMousePos.x = ev.clientX - canvasRect.left;
    CanvasMousePos.y = ev.clientY - canvasRect.top;

    CanvasMouseInside = (
        (CanvasMousePos.x >= 0) && (CanvasMousePos.x <= CANVAS.width) &&
        (CanvasMousePos.y >= 0) && (CanvasMousePos.y <= CANVAS.height)
    );
}

function setEnableScroll(enable : boolean) : void {
    const scrollDisabled = document.body.classList.contains("disableScroll");

    if (!enable && !scrollDisabled) {
        document.body.classList.add("disableScroll");
    } else if (enable && scrollDisabled) {
        document.body.classList.remove("disableScroll");
    }
}