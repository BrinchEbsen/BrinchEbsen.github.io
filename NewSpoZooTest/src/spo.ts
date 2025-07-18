const enum SpoState {
    Walk,
    Stand,
    Flee,
    Spin,
    WalkToPoint,
    StandStill
};

const SpoWalkBackInBoundsBuffer = 40;
const SpoBiasTowardMiddleBuffer = 60;

const SpoSpinChance : number = 0.002;

class Spo implements Sprite {
    public pos: Vec;
    public dir: Vec;
    public state: SpoState;
    public type: string;
    public speed: number;

    public target: Vec = {x: 0, y: 0};

    private animations = new Map<string, SpriteAnimation>;

    private timer : number = 0;

    constructor(pos : Vec, dir : Vec = {x: 0, y:1}, startState : SpoState = SpoState.Stand) {
        this.pos = pos;
        this.dir = dir;
        this.state = startState;
        this.type = "regular";
        this.speed = 2;

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

    takeStep(speedModif : number = 1) : void {
        this.dir = vecNormalize(this.dir);

        this.pos.x += this.dir.x * this.speed * speedModif;
        this.pos.y += this.dir.y * this.speed * speedModif;
    }

    makeStand(forFrames : number | undefined = undefined) : void {
        if (!forFrames)
            forFrames = randomIntFromTo(10, 240);
        
        this.setTimer(forFrames);
        this.state = SpoState.Stand;
    }

    makeWalk(forFrames : number | undefined = undefined) : void {
        if (!forFrames)
            forFrames = randomIntFromTo(10, 120);
        
        this.setTimer(forFrames);
        this.state = SpoState.Walk;
    }

    makeWalkRandomDirection(forFrames : number | undefined = undefined) : void {
        this.randomDir();
        this.makeWalk(forFrames);
    }

    makeWalkToPoint(point : Vec) {
        this.target = point;
        this.state = SpoState.WalkToPoint;
    }

    makeSpin(forFrames : number | undefined = undefined) : void {
        if (!forFrames)
            forFrames = randomIntFromTo(32, 64);
        
        this.setTimer(forFrames);
        this.state = SpoState.Spin;
    }

    testPastEdge(scene : SpoZooScene) {
        const ancor = this.anchorPos;

        const pastLeft = ancor.x < 0;
        const pastRight = ancor.x > scene.width;
        const pastTop = ancor.y < 0;
        const pastBottom = ancor.y > scene.height;

        if (!pastLeft && !pastRight && !pastTop && !pastBottom) return;

        const walkTo : Vec = {x: ancor.x, y: ancor.y};

        if (pastLeft) {
            walkTo.x = SpoWalkBackInBoundsBuffer;
        } else if (pastRight) {
            walkTo.x = scene.width - SpoWalkBackInBoundsBuffer;
        }
        if (pastTop) {
            walkTo.y = SpoWalkBackInBoundsBuffer;
        } else if (pastBottom) {
            walkTo.y = scene.height - SpoWalkBackInBoundsBuffer;
        }

        console.log("I'm walkin' back!");

        this.makeWalkToPoint(walkTo);
    }

    step(scene : SpoZooScene) : void {
        switch(this.state) {
            case SpoState.Walk:
                this.takeStep();
                if (this.tickTimer())
                    this.makeStand();
                break;
            
            case SpoState.Stand:
                if (this.tickTimer()) {
                    if (randomBool(SpoSpinChance)) {
                        this.makeSpin();
                    } else {
                        this.makeWalkRandomDirection();
                    }
                }
                break;

            case SpoState.Spin:
                if (this.timer % 2 == 0)
                    this.turn(false);
                if (this.tickTimer())
                    this.makeStand();
                break;
            
            case SpoState.WalkToPoint:
                this.dir = vecFromTo(this.anchorPos, this.target);
                this.takeStep();
                if (vecDist(this.anchorPos, this.target) < this.speed) {
                    this.makeStand();
                }
                break;
        }

        this.testPastEdge(scene);
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