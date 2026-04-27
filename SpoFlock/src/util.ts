/**
 * Search for radio buttons with the given name and return the checked one.
 * @param name The name in the input's "name" attribute.
 * @returns The checked radio element, or undefined if none were found.
 */
function getCheckedRadioElement(name: string): HTMLInputElement | undefined {
    const elems = document.querySelectorAll(`input[name=${name}]`);
    
    if (elems.length === 0) return undefined;
    
    for (let i = 0; i < elems.length; i++) {
        const e = elems[i] as HTMLInputElement;

        if (e.checked) return e;
    }
}

/**
 * Rotate an angle by 180 degrees.
 * @param ang Input angle in radians.
 * @returns The input angle turned by 180 degrees.
 */
function invertAngle(ang: number): number {
    let inv = ang + Math.PI;
    
    if (inv > Math.PI) {
      inv -= 2 * Math.PI;
    }

    return inv;
}