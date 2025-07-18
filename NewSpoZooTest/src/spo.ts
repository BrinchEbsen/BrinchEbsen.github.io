const enum SpoState {
    Walk,
    Stand,
    Flee,
    Spin,
    WalkToPoint,
    StandStill
};

class Spo implements Sprite {
    public pos: Vec;
    public dir: Vec;
    public state: SpoState;
    public type: string;

    private animations = new Map<string, SpriteAnimation>;

    private timer : number = 0;

    constructor(pos : Vec, dir : Vec = {x: 0, y:1}, startState : SpoState = SpoState.Stand) {
        this.pos = pos;
        this.dir = dir;
        this.state = startState;
        this.type = "regular";

        this.initAnimations();
    }

    initAnimations() : void {
        this.animations.clear();

        SpoAnimInfoList.forEach(info => {
            const name = this.type + "_" + info.name;

            const frames = SpoAnimFrames.get(name);

            if (frames === undefined)
                throw new Error(`Could not create animation ${info.name}, frames not present.`);

            const anim = new SpriteAnimation(frames, true, info.rate);

            this.animations.set(name, anim);
        });
    }

    get anchorPos(): Vec {
        return {
            x: this.pos.x + 64,
            y: this.pos.y + 80
        };
    }

    setTimer(val : number = randomIntFromTo(10, 240)) : void {
        this.timer = val;
    }

    tickTimer() : boolean {
        this.timer -= 1;
        if (this.timer < 0) {
            this.timer = 0;
            return true;
        }
        return false;
    }

    setType(type : string) : void {
        if (!SpoTypes.includes(type))
            throw new Error(`Type ${type} is not a valid Spo type!`);

        this.type = type;

        this.initAnimations();
    }

    randomDir() : void {
        const oneEighthAng = Math.PI / 4;

        const ang = oneEighthAng * randomIntFromTo(0, 8) - Math.PI;

        this.dir = {
            x: Math.sin(ang),
            y: Math.cos(ang)
        };
    }

    turn(left : boolean, amount : number = 1) : void {
        const oneEighthAng = Math.PI / 4;
        const ang = oneEighthAng * amount;

        this.setAng(ang);
    }

    setAng(ang : number) {
        this.dir = {
            x: Math.cos(ang)*this.dir.x - Math.sin(ang)*this.dir.y,
            y: Math.sin(ang)*this.dir.x + Math.cos(ang)*this.dir.y,
        };
    }

    step(scene : SpoZooScene) : void {
        this.state = SpoState.Walk;
        if (randomBool(0.3)) {
            this.randomDir();
        }
    }

    getAnimName() : string {
        let name = this.type + "_";

        switch(this.state) {
            case SpoState.Walk:
            case SpoState.Flee:
            case SpoState.WalkToPoint:
                name += "walk_";
                break;
            case SpoState.Stand:
            case SpoState.Spin:
            case SpoState.StandStill:
                name += "stand_";
                break;
        }

        name += vecDirectionName(this.dir);

        return name;
    }

    draw(ctx : CanvasRenderingContext2D) : void {
        const animName = this.getAnimName();
        const anim = this.animations.get(animName);

        if (anim === undefined) {
            throw new Error(`Spo animation ${animName} not present.`);
        }

        anim.draw(ctx, this.pos);
    }
}