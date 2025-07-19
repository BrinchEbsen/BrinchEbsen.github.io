class Flasher {
    public val: number;
    public min: number;
    public max: number;
    public step: number;
    public rising: boolean;

    constructor(min: number, max: number, step: number) {
        this.val = min;
        this.min = min;
        this.max = max;
        this.step = step;
        this.rising = false;
    }

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