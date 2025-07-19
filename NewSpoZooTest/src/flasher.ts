/**
 * Holds a value that bounces up and down.
 */
class Flasher {
    public val: number;
    public min: number;
    public max: number;
    public step: number;
    private rising: boolean;

    constructor(min: number, max: number, step: number) {
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
    next(): number {
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