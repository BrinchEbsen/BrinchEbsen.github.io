const CANVAS : HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const CTX : CanvasRenderingContext2D = CANVAS.getContext("2d")!;

const CanvasMousePos : Vec = {x: 0, y: 0};

function updateCanvasMousePos(ev : MouseEvent) : void {
    const rect : DOMRect = CANVAS.getBoundingClientRect();

    CanvasMousePos.x = ev.pageX - rect.left;
    CanvasMousePos.y = ev.pageY - rect.top;
}

function setEnableScroll(enable : boolean) : void {
    const scrollDisabled = document.body.classList.contains("disableScroll");

    if (!enable && !scrollDisabled) {
        document.body.classList.add("disableScroll");
    } else if (enable && scrollDisabled) {
        document.body.classList.remove("disableScroll");
    }
}