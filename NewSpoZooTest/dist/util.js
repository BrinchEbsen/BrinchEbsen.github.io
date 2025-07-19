"use strict";
function getCheckedRadioElement(name) {
    const elems = document.querySelectorAll(`input[name=${name}]`);
    if (elems.length === 0)
        return undefined;
    for (let i = 0; i < elems.length; i++) {
        const e = elems[i];
        if (e.checked)
            return e;
    }
}
