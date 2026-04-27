/**
 * Rectangle with an x, y, width and height.
 */
type Rect = {
    x: number,
    y: number,
    w: number,
    h: number
};

/**
 * Create a copy of a rectangle.
 * @param rect Input rectangle.
 * @returns A copy of the input rectangle.
 */
function rectCopy(rect: Rect): Rect {
    return {
        x: rect.x,
        y: rect.y,
        w: rect.w,
        h: rect.h
    };
}