function getCheckedRadioElement(name: string): HTMLInputElement | undefined {
    const elems = document.querySelectorAll(`input[name=${name}]`);
    
    if (elems.length === 0) return undefined;
    
    for (let i = 0; i < elems.length; i++) {
        const e = elems[i] as HTMLInputElement;

        if (e.checked) return e;
    }
}

function invertAngle(ang: number): number {
    let inv = ang + Math.PI;
    
    if (inv > Math.PI) {
      inv -= 2 * Math.PI;
    }

    return inv;
}