"use strict";
/**
 * Holds a value that bounces up and down.
 */
class Flasher {
    constructor(min, max, step) {
        this.val = min;
        this.min = min;
        this.max = max;
        this.step = step;
        this.rising = false;
    }
    /**
     * Advance the flasher and get the resulting value.
     * @returns The resulting value after advancing the flasher.
     */
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
