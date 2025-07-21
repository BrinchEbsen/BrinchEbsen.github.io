"use strict";
class Flasher {
    constructor(min, max, step) {
        this.val = min;
        this.min = min;
        this.max = max;
        this.step = step;
        this.rising = false;
    }
    next() {
        this.val += this.rising ? this.step : -this.step;
        if (this.val > this.max) {
            this.val = this.max;
            this.rising = false;
        }
        if (this.val < this.min) {
            this.val = this.min;
            this.rising = true;
        }
        return this.val;
    }
}
