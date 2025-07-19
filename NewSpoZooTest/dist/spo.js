"use strict";
;
const SpoWalkBackInBoundsBuffer = 40;
const SpoBiasTowardMiddleBuffer = 60;
const SpoHasntMovedTolerance = 0.1;
const SpoSpinChance = 0.002;
const SpoFleeRandomTurnChance = 0.1;
const SpoParticleSparkleChance = 0.03;
const SpoParticleSweatChance = 0.2;
const SpoFrameSize = 128;
const SpoBoundsBoxOffset = { x: 32, y: 32 };
const SpoBoundBoxSize = 64;
const SpoGrabRange = 40;
const SpoLookAtRange = 200;
const SpoScatterFromMouseRange = 400;
class Spo {
    constructor(pos, dir = { x: 0, y: 1 }, startState = 1 /* SpoState.Stand */) {
        this.target = { x: 0, y: 0 };
        this.animations = new Map;
        this.timer = 0;
        this.despawn = false;
        this.requestDelete = false;
        this.pos = pos;
        this.lastPos = vecCopy(this.pos);
        this.dir = dir;
        this.state = startState;
        this.type = "regular";
        this.speed = 2;
        this.initAnimations();
    }
    initAnimations() {
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
    get anchorPos() {
        return {
            x: this.pos.x + 64,
            y: this.pos.y + 80
        };
    }
    set anchorPos(val) {
        this.pos.x = val.x - 64;
        this.pos.y = val.y - 80;
    }
    get middlePos() {
        return {
            x: this.pos.x + 64,
            y: this.pos.y + 64
        };
    }
    set middlePos(val) {
        this.pos.x = val.x - 64;
        this.pos.y = val.y - 64;
    }
    setTimer(val = randomIntFromTo(10, 240)) {
        this.timer = val;
    }
    tickTimer() {
        this.timer -= 1;
        if (this.timer < 0) {
            this.timer = 0;
            return true;
        }
        return false;
    }
    setType(type) {
        this.type = type;
        this.initAnimations();
    }
    randomDir() {
        const oneEighthAng = Math.PI / 4;
        const ang = oneEighthAng * randomIntFromTo(0, 8) - Math.PI;
        this.facingAngle = ang;
    }
    turn(left, amount = 1) {
        const oneEighthAng = Math.PI / 4;
        let ang = oneEighthAng * amount;
        if (!left)
            ang = -ang;
        this.turnByAng(ang);
    }
    get facingAngle() {
        return vecGetAngle(this.dir);
    }
    set facingAngle(ang) {
        this.dir = vecFromAngle(ang);
    }
    turnByAng(ang) {
        this.dir = {
            x: Math.cos(ang) * this.dir.x - Math.sin(ang) * this.dir.y,
            y: Math.sin(ang) * this.dir.x + Math.cos(ang) * this.dir.y,
        };
    }
    takeStep(speedModif = 1) {
        const move = vecNormalize(this.dir);
        this.pos.x += move.x * this.speed * speedModif;
        this.pos.y += move.y * this.speed * speedModif;
    }
    makeStand(forFrames = undefined) {
        if (!forFrames)
            forFrames = randomIntFromTo(10, 240);
        this.setTimer(forFrames);
        this.state = 1 /* SpoState.Stand */;
    }
    makeWalk(forFrames = undefined) {
        if (!forFrames)
            forFrames = randomIntFromTo(10, 120);
        this.setTimer(forFrames);
        this.state = 0 /* SpoState.Walk */;
    }
    makeFlee(forFrames = undefined) {
        if (!forFrames)
            forFrames = randomIntFromTo(180, 240);
        this.setTimer(forFrames);
        this.state = 2 /* SpoState.Flee */;
    }
    makeWalkRandomDirection(forFrames = undefined) {
        this.randomDir();
        this.makeWalk(forFrames);
    }
    makeWalkToPoint(point) {
        this.target = point;
        this.state = 4 /* SpoState.WalkToPoint */;
    }
    makeSpin(forFrames = undefined) {
        if (!forFrames)
            forFrames = randomIntFromTo(32, 64);
        this.setTimer(forFrames);
        this.state = 3 /* SpoState.Spin */;
    }
    makeGrabbed() {
        this.state = 5 /* SpoState.Grabbed */;
    }
    allowScatter() {
        return (this.state !== 2 /* SpoState.Flee */ &&
            this.state !== 5 /* SpoState.Grabbed */);
    }
    wrapAtEdge(scene) {
        if (this.pos.x < -SpoFrameSize)
            this.pos.x = scene.width;
        if (this.pos.x > scene.width)
            this.pos.x = -SpoFrameSize;
        if (this.pos.y < -SpoFrameSize)
            this.pos.y = scene.height;
        if (this.pos.y > scene.height)
            this.pos.y = -SpoFrameSize;
    }
    testPastEdge(scene) {
        const ancor = this.anchorPos;
        const pastLeft = ancor.x < 0;
        const pastRight = ancor.x > scene.width;
        const pastTop = ancor.y < 0;
        const pastBottom = ancor.y > scene.height;
        if (!pastLeft && !pastRight && !pastTop && !pastBottom)
            return;
        const walkTo = { x: ancor.x, y: ancor.y };
        if (pastLeft) {
            walkTo.x = SpoWalkBackInBoundsBuffer;
        }
        else if (pastRight) {
            walkTo.x = scene.width - SpoWalkBackInBoundsBuffer;
        }
        if (pastTop) {
            walkTo.y = SpoWalkBackInBoundsBuffer;
        }
        else if (pastBottom) {
            walkTo.y = scene.height - SpoWalkBackInBoundsBuffer;
        }
        this.dir = vecFromTo(this.anchorPos, walkTo);
        this.makeWalk(randomIntFromTo(40, 80));
    }
    testOutsideEdge(scene) {
        if ((this.pos.x < -SpoFrameSize) || (this.pos.x > scene.width) ||
            (this.pos.y < -SpoFrameSize) || (this.pos.y > scene.height)) {
            return true;
        }
        else {
            return false;
        }
    }
    handleWalk() {
        this.takeStep();
        if (this.tickTimer())
            this.makeStand();
    }
    handleStand() {
        if (this.tickTimer()) {
            if (randomBool(SpoSpinChance)) {
                this.makeSpin();
            }
            else {
                this.makeWalkRandomDirection();
            }
        }
    }
    handleFlee() {
        this.takeStep(2);
        if (randomBool(SpoFleeRandomTurnChance))
            this.turn(randomBool(), randomFromTo(0.5, 1.5));
        if (this.tickTimer())
            this.makeStand();
    }
    handleSpin() {
        this.turn(false, 0.5);
        if (this.tickTimer())
            this.makeStand();
    }
    handleWalkToPoint() {
        this.dir = vecFromTo(this.anchorPos, this.target);
        this.takeStep();
        if (vecDist(this.anchorPos, this.target) < this.speed)
            this.makeStand();
    }
    handleCollision(scene) {
        scene.fences.forEach(f => {
            const result = f.testCollision(this.anchorPos);
            if (result.hit) {
                this.anchorPos = vecCopy(result.newPos);
            }
        });
    }
    shouldDoCollision() {
        return this.state != 5 /* SpoState.Grabbed */;
    }
    hasMovedThisFrame(tolerance = 0) {
        const dist = vecDist(this.pos, this.lastPos);
        return dist > tolerance;
    }
    spawnSparkleParticle(scene) {
        const sys = scene.particles.get(0 /* ParticleType.Sparkle */);
        if (!sys)
            return;
        //Add a sparkle particle inside the spo's bounds box (plus a margin)
        sys.addParticleRange(this.pos.x + SpoBoundsBoxOffset.x + 20, this.pos.x + SpoBoundsBoxOffset.x + SpoBoundBoxSize - 20, this.pos.y + SpoBoundsBoxOffset.y + 20, this.pos.y + SpoBoundBoxSize + SpoBoundsBoxOffset.y - 20, {
            //Slowly fly away from the spo's center
            flyAwayFrom: {
                point: this.middlePos,
                vel: 0.4
            }
        });
    }
    spawnSweatParticle(scene) {
        const sys = scene.particles.get(1 /* ParticleType.Sweat */);
        if (!sys)
            return;
        //Get a random position in an arc above the spo's head
        const randomVec = vecFromAngle(randomBool()
            ? randomFromTo(-Math.PI, (-Math.PI) / 2)
            : randomFromTo(Math.PI, Math.PI / 2), 30);
        const particlePos = vecAdd(vecAdd(this.middlePos, randomVec), //This position plus the random arc position
        { x: 0, y: -10 } //a bit above that
        );
        sys.addParticle(particlePos, {
            //Be affected just a bit by gravity
            flyInDirection: {
                vel: { x: 0, y: 0 },
                acc: { x: 0, y: 0.15 }
            },
            //Fly away from the spo
            flyAwayFrom: {
                point: this.middlePos,
                vel: 2
            }
        });
    }
    handleParticles(scene) {
        if (this.type === "gold") {
            if (randomBool(SpoParticleSparkleChance)) {
                this.spawnSparkleParticle(scene);
            }
        }
        if (this.state === 5 /* SpoState.Grabbed */) {
            if (randomBool(SpoParticleSweatChance)) {
                this.spawnSweatParticle(scene);
            }
        }
    }
    step(scene) {
        if (this.requestDelete)
            return;
        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y;
        switch (this.state) {
            case 0 /* SpoState.Walk */:
                this.handleWalk();
                break;
            case 1 /* SpoState.Stand */:
                this.handleStand();
                break;
            case 2 /* SpoState.Flee */:
                this.handleFlee();
                break;
            case 3 /* SpoState.Spin */:
                this.handleSpin();
                break;
            case 4 /* SpoState.WalkToPoint */:
                this.handleWalkToPoint();
                break;
        }
        if (this.shouldDoCollision())
            this.handleCollision(scene);
        if (scene.removeSpos) {
            if (this.testOutsideEdge(scene)) {
                this.requestDelete = true;
            }
        }
        else {
            this.wrapAtEdge(scene);
        }
        this.handleParticles(scene);
    }
    getAnimName() {
        let name = this.type + "_";
        switch (this.state) {
            case 0 /* SpoState.Walk */:
            case 2 /* SpoState.Flee */:
            case 4 /* SpoState.WalkToPoint */:
            case 5 /* SpoState.Grabbed */:
                name += "walk_";
                break;
            case 1 /* SpoState.Stand */:
            case 3 /* SpoState.Spin */:
                name += "stand_";
                break;
        }
        name += vecDirectionName(this.dir);
        return name;
    }
    draw(ctx) {
        const animName = this.getAnimName();
        const anim = this.animations.get(animName);
        if (anim === undefined) {
            throw new Error(`Spo animation ${animName} not present.`);
        }
        let size = 1;
        let rate = 1;
        let pos = vecCopy(this.pos);
        switch (this.state) {
            case 2 /* SpoState.Flee */:
                rate = 2;
                break;
            case 5 /* SpoState.Grabbed */:
                rate = 4;
                size = 1.5;
                pos.x += randomFromTo(-2, 2);
                pos.y += randomFromTo(-2, 2);
                break;
        }
        anim.draw(ctx, pos, size, rate);
    }
    event_mousedown(mousePos, checkGrab = false) {
        let gotGrabbed = false;
        if (checkGrab && this.state !== 5 /* SpoState.Grabbed */) {
            const dist = vecDist(this.middlePos, mousePos);
            if (dist < SpoGrabRange) {
                this.middlePos = vecCopy(mousePos);
                this.makeGrabbed();
                gotGrabbed = true;
            }
        }
        if (!gotGrabbed) {
            if (!this.allowScatter())
                return;
            //Scatter from the mouse click
            const vecDir = vecFromTo(mousePos, this.anchorPos);
            const dist = vecLength(vecDir);
            if (dist < SpoScatterFromMouseRange) {
                this.dir = vecDir;
                this.makeWalk();
            }
        }
    }
    event_mousemove(mousePos) {
        if (this.state === 5 /* SpoState.Grabbed */) {
            this.middlePos = vecCopy(mousePos);
        }
        else if (this.state === 1 /* SpoState.Stand */) {
            const dist = vecDist(this.middlePos, mousePos);
            if (dist < SpoLookAtRange) {
                this.dir = vecFromTo(this.anchorPos, mousePos);
            }
        }
    }
    event_mouseup(mousePos) {
        if (this.state === 5 /* SpoState.Grabbed */) {
            this.makeFlee();
        }
    }
}
