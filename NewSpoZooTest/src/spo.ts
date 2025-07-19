const enum SpoState {
    Walk,
    Stand,
    Flee,
    Spin,
    WalkToPoint,
    Grabbed
};

const SpoWalkBackInBoundsBuffer = 40;
const SpoBiasTowardMiddleBuffer = 60;

const SpoSpinChance = 0.002;
const SpoFleeRandomTurnChance = 0.1;

const SpoGoldenSparkleSpawnChance = 0.03;

const SpoFrameSize = 128;
const SpoBoundsBoxOffset: Vec = {x: 32, y: 32};
const SpoBoundBoxSize = 64;

const SpoGrabRange = 40;
const SpoLookAtRange = 200;
const SpoScatterFromMouseRange = 400;

class Spo implements Sprite {
    public pos: Vec;
    public dir: Vec;
    public state: SpoState;

    //Only set through setType, as animations need to be re-initialized
    private type: SpoType;

    public speed: number;

    public target: Vec = {x: 0, y: 0};

    private animations = new Map<string, SpriteAnimation>;

    private timer: number = 0;

    public despawn: boolean = false;
    public requestDelete: boolean = false;

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
    set anchorPos(val: Vec) {
        this.pos.x = val.x - 64;
        this.pos.y = val.y - 80;
    }
    get middlePos(): Vec {
        return {
            x: this.pos.x + 64,
            y: this.pos.y + 64
        };
    }
    set middlePos(val: Vec) {
        this.pos.x = val.x - 64;
        this.pos.y = val.y - 64;
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

    setType(type : SpoType) : void {
        this.type = type;

        this.initAnimations();
    }

    randomDir() : void {
        const oneEighthAng = Math.PI / 4;

        const ang = oneEighthAng * randomIntFromTo(0, 8) - Math.PI;

        this.facingAngle = ang;
    }

    turn(left : boolean, amount : number = 1) : void {
        const oneEighthAng = Math.PI / 4;
        let ang = oneEighthAng * amount;

        if (!left)
            ang = -ang;

        this.turnByAng(ang);
    }

    get facingAngle(): number {
        return Math.atan2(this.dir.x, this.dir.y);
    }

    set facingAngle(ang: number) {
        this.dir.x = Math.sin(ang);
        this.dir.y = Math.cos(ang);
    }

    turnByAng(ang : number) {
        this.dir = {
            x: Math.cos(ang)*this.dir.x - Math.sin(ang)*this.dir.y,
            y: Math.sin(ang)*this.dir.x + Math.cos(ang)*this.dir.y,
        };
    }

    takeStep(speedModif : number = 1) : void {
        const move = vecNormalize(this.dir);

        this.pos.x += move.x * this.speed * speedModif;
        this.pos.y += move.y * this.speed * speedModif;
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

    makeFlee(forFrames : number | undefined = undefined) : void {
        if (!forFrames)
            forFrames = randomIntFromTo(180, 240);
        
        this.setTimer(forFrames);
        this.state = SpoState.Flee;
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

    makeGrabbed(): void {
        this.state = SpoState.Grabbed;
    }

    allowScatter(): boolean {
        return (
            this.state !== SpoState.Flee &&
            this.state !== SpoState.Grabbed
        );
    }

    testPastEdge(scene : SpoZooScene): void {
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

        this.dir = vecFromTo(this.anchorPos, walkTo);
        this.makeWalk(randomIntFromTo(40, 80));
    }

    testOutsideEdge(scene : SpoZooScene): boolean {
        if (
            (this.pos.x < -SpoFrameSize) || (this.pos.x > scene.width) ||
            (this.pos.y < -SpoFrameSize) || (this.pos.y > scene.height)
        ) {
            return true;
        } else {
            return false;
        }
    }

    handleWalk() : void {
        this.takeStep();

        if (this.tickTimer())
            this.makeStand();
    }

    handleStand() : void {
        if (this.tickTimer()) {
            if (randomBool(SpoSpinChance)) {
                this.makeSpin();
            } else {
                this.makeWalkRandomDirection();
            }
        }
    }

    handleFlee() : void {
        this.takeStep(2);

        if (randomBool(SpoFleeRandomTurnChance))
            this.turn(randomBool(), randomFromTo(0.5, 1.5));

        if (this.tickTimer())
            this.makeStand();
    }

    handleSpin() : void {
        if (this.timer % 2 == 0)
            this.turn(false);
        if (this.tickTimer())
            this.makeStand();
    }

    handleWalkToPoint() : void {
        this.dir = vecFromTo(this.anchorPos, this.target);
        this.takeStep();
        if (vecDist(this.anchorPos, this.target) < this.speed)
            this.makeStand();
    }

    handleCollision(scene: SpoZooScene): void {
        scene.fences.forEach(f => {
            const result = f.testCollision(this.anchorPos);
            if (result.hit) {
                this.anchorPos = vecCopy(result.newPos);
            }
        });
    }

    shouldDoCollision(): boolean {
        return this.state != SpoState.Grabbed;
    }

    step(scene : SpoZooScene) : void {
        if (this.requestDelete) return;

        switch(this.state) {
            case SpoState.Walk:
                this.handleWalk();
                break;
            case SpoState.Stand:
                this.handleStand();
                break;
            case SpoState.Flee:
                this.handleFlee();
                break;
            case SpoState.Spin:
                this.handleSpin();
                break;
            case SpoState.WalkToPoint:
                this.handleWalkToPoint();
                break;
        }

        if (this.shouldDoCollision())
            this.handleCollision(scene);

        if (this.despawn) {
            if (this.testOutsideEdge(scene)) {
                this.requestDelete = true;
            }
        } else {
            this.testPastEdge(scene);
        }

        if (this.type === "gold") {
            if (randomBool(SpoGoldenSparkleSpawnChance)) {
                scene.sparkles.addParticleRange(
                    this.pos.x + SpoBoundsBoxOffset.x,
                    this.pos.x + SpoBoundsBoxOffset.x + SpoBoundBoxSize,

                    this.pos.y + SpoBoundsBoxOffset.y,
                    this.pos.y + SpoBoundBoxSize + SpoBoundsBoxOffset.y
                )
            }
        }
    }

    getAnimName() : string {
        let name = this.type + "_";

        switch(this.state) {
            case SpoState.Walk:
            case SpoState.Flee:
            case SpoState.WalkToPoint:
            case SpoState.Grabbed:
                name += "walk_";
                break;
            case SpoState.Stand:
            case SpoState.Spin:
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

        let size = 1;
        let rate = 1;

        switch (this.state) {
            case SpoState.Flee:
                rate = 2;
                break;
            case SpoState.Grabbed:
                rate = 4;
                size = 1.5;
                break;
        }

        anim.draw(ctx, this.pos, size, rate);
    }

    event_mousedown(mousePos: Vec, checkGrab: boolean = false): void {
        let gotGrabbed = false;
        
        if (checkGrab && this.state !== SpoState.Grabbed) {
            const dist = vecDist(this.middlePos, mousePos);
            if (dist < SpoGrabRange) {
                this.middlePos = vecCopy(mousePos);
                this.makeGrabbed();
                gotGrabbed = true;
            }
        }

        if (!gotGrabbed) {
            if (!this.allowScatter()) return;

            //Scatter from the mouse click
            const vecDir = vecFromTo(mousePos, this.anchorPos);
            const dist = vecLength(vecDir);

            if (dist < SpoScatterFromMouseRange) {
                this.dir = vecDir;
                this.makeWalk();
            }
        }
    }

    event_mousemove(mousePos: Vec): void {
        if (this.state === SpoState.Grabbed) {
            this.middlePos = vecCopy(mousePos);
        } else if (this.state === SpoState.Stand) {
            const dist = vecDist(this.middlePos, mousePos);
            if (dist < SpoLookAtRange) {
                this.dir = vecFromTo(this.anchorPos, mousePos);
            }
        }
    }

    event_mouseup(mousePos: Vec): void {
        if (this.state === SpoState.Grabbed) {
            this.makeFlee();
        }
    }
}