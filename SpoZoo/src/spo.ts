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

const SpoHasntMovedTolerance = 0.1;

const SpoGoldenChance = 1/50;
const SpoSpinChance = 0.002;
const SpoFleeRandomTurnChance = 0.1;

const SpoParticleSparkleChance = 0.03;
const SpoParticleSweatChance = 0.2;
const SpoParticleWispChance = 0.03;

const SpoFrameSize = 128;
const SpoBoundsBoxOffset: Vec = {x: 32, y: 32};
const SpoBoundBoxSize = 64;

const SpoGrabRange = 30;
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

    public randDirBias: number | undefined;

    public triedMoveLastFrame: boolean;
    public movedLastFrame: boolean;

    private animations = new Map<string, SpriteAnimation>();

    private timer: number = 0;

    public despawn: boolean = false;
    public requestDelete: boolean = false;

    constructor(pos: Vec, dir: Vec = {x: 0, y:1}, startState: SpoState = SpoState.Stand) {
        this.pos = pos;
        this.dir = dir;
        this.state = startState;
        this.type = "regular";
        this.speed = 2;
        this.triedMoveLastFrame = false;
        this.movedLastFrame = false;

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

    getType(): SpoType {
        return this.type;
    }

    randomDir() : void {
        const oneEighthAng = Math.PI / 4;

        if (this.randDirBias === undefined) {
            const ang = oneEighthAng * randomIntFromTo(0, 8) - Math.PI;
            this.facingAngle = ang;
        } else {
            this.dir = vecTurnByAngle(
                vecFromAngle(this.randDirBias),
                randomIntFromTo(-1, 1) * oneEighthAng
            );

            this.randDirBias = undefined;
        }
    }

    turn(left : boolean, amount : number = 1) : void {
        const oneEighthAng = Math.PI / 4;
        let ang = oneEighthAng * amount;

        if (!left)
            ang = -ang;

        this.turnByAng(ang);
    }

    get facingAngle(): number {
        return vecGetAngle(this.dir);
    }

    set facingAngle(ang: number) {
        this.dir = vecFromAngle(ang);
    }

    turnByAng(ang : number) {
        this.dir = vecTurnByAngle(this.dir, ang);
    }

    inMovingState(): boolean {
        switch (this.state) {
            case SpoState.Walk:
            case SpoState.WalkToPoint:
            case SpoState.Flee:
                return true;
        }

        return false;
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

    ateCarrot(): void {
        if (randomBool(SpoGoldenChance) && this.type !== "gold") {
            this.setType("gold");
        } else {
            const possibleTypes = SpoTypes.filter(t => {
                return t !== this.type && t !== "gold"
            });

            const newType = possibleTypes[
                randomIntFromTo(0, possibleTypes.length)
            ] as SpoType;

            this.setType(newType);
        }
    }

    testFeedCarrot(carrot: Carrot, theZoo: SpoZoo): boolean {
        const dist = vecDist(this.middlePos, carrot.middlePos);

        if (dist < SpoBoundBoxSize/2) {
            this.ateCarrot();
            theZoo.spawnGenericParticleEffect(this.middlePos, SpoBoundBoxSize/2, 2);
            return true;
        }

        return false;
    }

    allowScatter(): boolean {
        return (
            this.state !== SpoState.Flee &&
            this.state !== SpoState.Grabbed
        );
    }

    wrapAtEdge(scene: SpoZooScene): void {
        if (this.pos.x < -SpoFrameSize)
            this.pos.x = scene.width;

        if (this.pos.x > scene.width)
            this.pos.x = -SpoFrameSize;

        if (this.pos.y < -SpoFrameSize)
            this.pos.y = scene.height;

        if (this.pos.y > scene.height)
            this.pos.y = -SpoFrameSize;
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
        this.turn(false, 0.5);

        if (this.tickTimer())
            this.makeStand();
    }

    handleWalkToPoint() : void {
        this.dir = vecFromTo(this.anchorPos, this.target);
        this.takeStep();
        if (vecDist(this.anchorPos, this.target) < this.speed)
            this.makeStand();
    }

    handleSpoCollision(other: Spo): void {
        if (other.state === SpoState.Grabbed) return;

        //Quick rough check before any heavy calculations
        if (
            (this.pos.x + SpoBoundBoxSize < other.pos.x) ||
            (this.pos.x - SpoBoundBoxSize > other.pos.x) ||
            (this.pos.y + SpoBoundBoxSize < other.pos.y) ||
            (this.pos.y - SpoBoundBoxSize > other.pos.y)
        ) {
            return;
        }

        const vecBetween = vecFromTo(other.pos, this.pos);
        const dist = vecLength(vecBetween);
        
        if (dist < SpoBoundBoxSize/2) {
            const pushVec = vecNormalize(vecBetween, (SpoBoundBoxSize/2)-dist);
            this.pos = vecAdd(this.pos, pushVec);
        }
    }

    handleCollision(scene: SpoZooScene): void {
        scene.spos.forEach(s => {
            this.handleSpoCollision(s);
        });

        scene.fences.forEach(f => {
            const result = f.testCollision(this.anchorPos);
            if (result.hit) {
                const pushDir = vecFromTo(this.anchorPos, result.newPos);
                this.randDirBias = vecGetAngle(pushDir);
                this.anchorPos = vecCopy(result.newPos);
            }
        });
    }

    shouldDoCollision(): boolean {
        return this.state != SpoState.Grabbed;
    }

    spawnSparkleParticle(scene: SpoZooScene): void {
        const sys = scene.particles.get(ParticleType.Sparkle);
        if (!sys) return;

        //Add a sparkle particle inside the spo's bounds box (plus a margin)
        sys.addParticleRange(
            this.pos.x + SpoBoundsBoxOffset.x + 20,
            this.pos.x + SpoBoundsBoxOffset.x + SpoBoundBoxSize - 20,

            this.pos.y + SpoBoundsBoxOffset.y + 20,
            this.pos.y + SpoBoundBoxSize + SpoBoundsBoxOffset.y - 20,

            {
                //Slowly fly away from the spo's center
                flyAwayFrom: {
                    point: this.middlePos,
                    vel: 0.4
                }
            }
        )
    }

    spawnWispParticle(scene: SpoZooScene): void {
        const sys = scene.particles.get(ParticleType.Wisp);
        if (!sys) return;

        const x = randomFromTo(
            this.pos.x + SpoBoundsBoxOffset.x + 20,
            this.pos.x + SpoBoundsBoxOffset.x + SpoBoundBoxSize - 20
        );

        const y = randomFromTo(
            this.pos.y + SpoBoundsBoxOffset.y + 20,
            this.pos.y + SpoBoundBoxSize + SpoBoundsBoxOffset.y
        );

        //Fly to the left if on the left, and vice versa
        const xVel = x < this.middlePos.x ? -0.1 : 0.1;

        sys.addParticle({x: x, y: y},
            {
                flyInDirection: {
                    vel: {x: xVel, y: -0.2}
                }
            }
        )
    }

    spawnSweatParticle(scene: SpoZooScene): void {
        const sys = scene.particles.get(ParticleType.Sweat);
        if (!sys) return;

        //Get a random position in an arc above the spo's head
        const randomVec = vecFromAngle(
            randomBool()
                ? randomFromTo(-Math.PI, (-Math.PI)/2)
                : randomFromTo(Math.PI,  Math.PI/2),
            30
        );

        const particlePos = vecAdd(
            vecAdd(this.middlePos, randomVec), //This position plus the random arc position
            {x: 0, y: -10} //a bit above that
        );

        sys.addParticle(particlePos,
            {
                //Be affected just a bit by gravity
                flyInDirection: {
                    vel: {x: 0, y: 0},
                    acc: {x: 0, y: 0.15}
                },
                //Fly away from the spo
                flyAwayFrom: {
                    point: this.middlePos,
                    vel: 2
                }
            }
        );
    }

    handleParticles(scene: SpoZooScene) {
        if (this.type === "gold") {
            if (randomBool(SpoParticleSparkleChance)) {
                this.spawnSparkleParticle(scene);
            }
        } else if (this.type === "void") {
            if (randomBool(SpoParticleWispChance)) {
                this.spawnWispParticle(scene);
            }
        }

        if (this.state === SpoState.Grabbed) {
            if (randomBool(SpoParticleSweatChance)) {
                this.spawnSweatParticle(scene);
            }
        }
    }

    handleState(scene: SpoZooScene) {
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
    }

    step(scene: SpoZooScene) : void {
        if (this.requestDelete) return;
        
        if (this.triedMoveLastFrame && !this.movedLastFrame) {
            this.makeStand();
        }

        const preFramePos = vecCopy(this.pos);

        this.triedMoveLastFrame = this.inMovingState();
        this.handleState(scene);

        if (this.shouldDoCollision())
            this.handleCollision(scene);

        if (scene.removeSpos) {
            if (this.testOutsideEdge(scene)) {
                this.requestDelete = true;
            }
        } else {
            this.wrapAtEdge(scene);
        }

        this.movedLastFrame = vecDist(this.pos, preFramePos) > SpoHasntMovedTolerance;

        this.handleParticles(scene);
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

        let dirName = vecDirectionName(this.dir);
        if (dirName === "none") dirName = "down";
        name += dirName;

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
        let pos = vecCopy(this.pos);

        switch (this.state) {
            case SpoState.Flee:
                rate = 2;
                break;
            case SpoState.Grabbed:
                rate = 4;
                size = 1.5;
                pos.x += randomFromTo(-2, 2);
                pos.y += randomFromTo(-2, 2);
                break;
        }

        anim.draw(ctx, pos, size, rate);
    }

    event_mousedown(mousePos: Vec, checkGrab: boolean = false, checkSpook: boolean): void {
        let gotGrabbed = false;
        
        if (checkGrab && this.state !== SpoState.Grabbed) {
            const dist = vecDist(this.middlePos, mousePos);
            if (dist < SpoGrabRange) {
                this.middlePos = vecCopy(mousePos);
                this.makeGrabbed();
                gotGrabbed = true;
            }
        }

        if (!gotGrabbed && checkSpook) {
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