"use strict";
;
const SpoWalkBackInBoundsBuffer = 40;
const SpoBiasTowardMiddleBuffer = 60;
const SpoHasntMovedTolerance = 0.1;
const SpoGoldenChance = 1 / 50;
const SpoSpinChance = 0.002;
const SpoFleeRandomTurnChance = 0.1;
const SpoParticleSparkleChance = 0.03;
const SpoParticleSweatChance = 0.2;
const SpoParticleWispChance = 0.03;
const SpoFrameSize = 128;
const SpoBoundsBoxOffset = { x: 32, y: 32 };
const SpoBoundBoxSize = 64;
const SpoGrabRange = 30;
const SpoLookAtRange = 200;
const SpoScatterFromMouseRange = 400;
class Spo {
    constructor(pos, dir = { x: 0, y: 1 }, startState = 1) {
        this.target = { x: 0, y: 0 };
        this.animations = new Map();
        this.timer = 0;
        this.despawn = false;
        this.requestDelete = false;
        this.pos = pos;
        this.dir = dir;
        this.state = startState;
        this.type = "regular";
        this.speed = 2;
        this.triedMoveLastFrame = false;
        this.movedLastFrame = false;
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
    getType() {
        return this.type;
    }
    randomDir() {
        const oneEighthAng = Math.PI / 4;
        if (this.randDirBias === undefined) {
            const ang = oneEighthAng * randomIntFromTo(0, 8) - Math.PI;
            this.facingAngle = ang;
        }
        else {
            this.dir = vecTurnByAngle(vecFromAngle(this.randDirBias), randomIntFromTo(-1, 1) * oneEighthAng);
            this.randDirBias = undefined;
        }
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
        this.dir = vecTurnByAngle(this.dir, ang);
    }
    inMovingState() {
        switch (this.state) {
            case 0:
            case 4:
            case 2:
                return true;
        }
        return false;
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
        this.state = 1;
    }
    makeWalk(forFrames = undefined) {
        if (!forFrames)
            forFrames = randomIntFromTo(10, 120);
        this.setTimer(forFrames);
        this.state = 0;
    }
    makeFlee(forFrames = undefined) {
        if (!forFrames)
            forFrames = randomIntFromTo(180, 240);
        this.setTimer(forFrames);
        this.state = 2;
    }
    makeWalkRandomDirection(forFrames = undefined) {
        this.randomDir();
        this.makeWalk(forFrames);
    }
    makeWalkToPoint(point) {
        this.target = point;
        this.state = 4;
    }
    makeSpin(forFrames = undefined) {
        if (!forFrames)
            forFrames = randomIntFromTo(32, 64);
        this.setTimer(forFrames);
        this.state = 3;
    }
    makeGrabbed() {
        this.state = 5;
    }
    ateCarrot() {
        if (randomBool(SpoGoldenChance) && this.type !== "gold") {
            this.setType("gold");
        }
        else {
            const possibleTypes = SpoTypes.filter(t => {
                return t !== this.type && t !== "gold";
            });
            const newType = possibleTypes[randomIntFromTo(0, possibleTypes.length)];
            this.setType(newType);
        }
    }
    testFeedCarrot(carrot, theZoo) {
        const dist = vecDist(this.middlePos, carrot.middlePos);
        if (dist < SpoBoundBoxSize / 2) {
            this.ateCarrot();
            theZoo.spawnGenericParticleEffect(this.middlePos, SpoBoundBoxSize / 2, 2);
            return true;
        }
        return false;
    }
    allowScatter() {
        return (this.state !== 2 &&
            this.state !== 5);
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
    handleSpoCollision(other) {
        if (other.state === 5)
            return;
        if ((this.pos.x + SpoBoundBoxSize < other.pos.x) ||
            (this.pos.x - SpoBoundBoxSize > other.pos.x) ||
            (this.pos.y + SpoBoundBoxSize < other.pos.y) ||
            (this.pos.y - SpoBoundBoxSize > other.pos.y)) {
            return;
        }
        const vecBetween = vecFromTo(other.pos, this.pos);
        const dist = vecLength(vecBetween);
        if (dist < SpoBoundBoxSize / 2) {
            const pushVec = vecNormalize(vecBetween, (SpoBoundBoxSize / 2) - dist);
            this.pos = vecAdd(this.pos, pushVec);
        }
    }
    handleCollision(scene) {
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
    shouldDoCollision() {
        return this.state != 5;
    }
    spawnSparkleParticle(scene) {
        const sys = scene.particles.get(0);
        if (!sys)
            return;
        sys.addParticleRange(this.pos.x + SpoBoundsBoxOffset.x + 20, this.pos.x + SpoBoundsBoxOffset.x + SpoBoundBoxSize - 20, this.pos.y + SpoBoundsBoxOffset.y + 20, this.pos.y + SpoBoundBoxSize + SpoBoundsBoxOffset.y - 20, {
            flyAwayFrom: {
                point: this.middlePos,
                vel: 0.4
            }
        });
    }
    spawnWispParticle(scene) {
        const sys = scene.particles.get(1);
        if (!sys)
            return;
        const x = randomFromTo(this.pos.x + SpoBoundsBoxOffset.x + 20, this.pos.x + SpoBoundsBoxOffset.x + SpoBoundBoxSize - 20);
        const y = randomFromTo(this.pos.y + SpoBoundsBoxOffset.y + 20, this.pos.y + SpoBoundBoxSize + SpoBoundsBoxOffset.y);
        const xVel = x < this.middlePos.x ? -0.1 : 0.1;
        sys.addParticle({ x: x, y: y }, {
            flyInDirection: {
                vel: { x: xVel, y: -0.2 }
            }
        });
    }
    spawnSweatParticle(scene) {
        const sys = scene.particles.get(2);
        if (!sys)
            return;
        const randomVec = vecFromAngle(randomBool()
            ? randomFromTo(-Math.PI, (-Math.PI) / 2)
            : randomFromTo(Math.PI, Math.PI / 2), 30);
        const particlePos = vecAdd(vecAdd(this.middlePos, randomVec), { x: 0, y: -10 });
        sys.addParticle(particlePos, {
            flyInDirection: {
                vel: { x: 0, y: 0 },
                acc: { x: 0, y: 0.15 }
            },
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
        else if (this.type === "void") {
            if (randomBool(SpoParticleWispChance)) {
                this.spawnWispParticle(scene);
            }
        }
        if (this.state === 5) {
            if (randomBool(SpoParticleSweatChance)) {
                this.spawnSweatParticle(scene);
            }
        }
    }
    handleState(scene) {
        switch (this.state) {
            case 0:
                this.handleWalk();
                break;
            case 1:
                this.handleStand();
                break;
            case 2:
                this.handleFlee();
                break;
            case 3:
                this.handleSpin();
                break;
            case 4:
                this.handleWalkToPoint();
                break;
        }
    }
    step(scene) {
        if (this.requestDelete)
            return;
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
        }
        else {
            this.wrapAtEdge(scene);
        }
        this.movedLastFrame = vecDist(this.pos, preFramePos) > SpoHasntMovedTolerance;
        this.handleParticles(scene);
    }
    getAnimName() {
        let name = this.type + "_";
        switch (this.state) {
            case 0:
            case 2:
            case 4:
            case 5:
                name += "walk_";
                break;
            case 1:
            case 3:
                name += "stand_";
                break;
        }
        let dirName = vecDirectionName(this.dir);
        if (dirName === "none")
            dirName = "down";
        name += dirName;
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
            case 2:
                rate = 2;
                break;
            case 5:
                rate = 4;
                size = 1.5;
                pos.x += randomFromTo(-2, 2);
                pos.y += randomFromTo(-2, 2);
                break;
        }
        anim.draw(ctx, pos, size, rate);
    }
    event_mousedown(mousePos, checkGrab = false, checkSpook) {
        let gotGrabbed = false;
        if (checkGrab && this.state !== 5) {
            const dist = vecDist(this.middlePos, mousePos);
            if (dist < SpoGrabRange) {
                this.middlePos = vecCopy(mousePos);
                this.makeGrabbed();
                gotGrabbed = true;
            }
        }
        if (!gotGrabbed && checkSpook) {
            if (!this.allowScatter())
                return;
            const vecDir = vecFromTo(mousePos, this.anchorPos);
            const dist = vecLength(vecDir);
            if (dist < SpoScatterFromMouseRange) {
                this.dir = vecDir;
                this.makeWalk();
            }
        }
    }
    event_mousemove(mousePos) {
        if (this.state === 5) {
            this.middlePos = vecCopy(mousePos);
        }
        else if (this.state === 1) {
            const dist = vecDist(this.middlePos, mousePos);
            if (dist < SpoLookAtRange) {
                this.dir = vecFromTo(this.anchorPos, mousePos);
            }
        }
    }
    event_mouseup(mousePos) {
        if (this.state === 5) {
            this.makeFlee();
        }
    }
}
