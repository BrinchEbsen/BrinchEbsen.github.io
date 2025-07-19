const CANVAS : HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const CTX : CanvasRenderingContext2D = CANVAS.getContext("2d")!;

let CanvasMouseInside = false;
const CanvasMousePos : Vec = {x: 0, y: 0};

function updateCanvasMousePos(ev : MouseEvent) : void {
    const bodyRect : DOMRect = document.body.getBoundingClientRect();
    const canvasRect : DOMRect = CANVAS.getBoundingClientRect();

    const offsX = canvasRect.left - bodyRect.left;
    const offsY = canvasRect.top  - bodyRect.top;
    
    CanvasMousePos.x = ev.pageX - offsX;
    CanvasMousePos.y = ev.pageY - offsY;

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