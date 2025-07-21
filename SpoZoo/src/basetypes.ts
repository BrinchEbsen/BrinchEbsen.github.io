type Rect = {
    x: number,
    y: number,
    w: number,
    h: number
};

function rectCopy(rect: Rect): Rect {
    return {
        x: rect.x,
        y: rect.y,
        w: rect.w,
        h: rect.h
    };
}