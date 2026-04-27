"use strict";
const SpoParticleSparkleChance = 0.03;
const SpoParticleWispChance = 0.03;
const SpoFrameSize = 128;
const SpoBoundsBoxOffset = { x: 32, y: 32 };
const SpoBoundBoxSize = 64;
let SpoTargetSpeed = 5;
let SpoSeparationFactor = 7;
let SpoAlignmentFactor = 20;
let SpoCohesionFactor = 0.5;
let SpoCursorBiasFactor = 0.5;
class Spo {
    get pos() {
        return this.currState.pos;
    }
    set pos(val) {
        this.nextState.pos = val;
    }
    constructor(pos) {
        this.currState = {
            pos: vecEmpty(),
            vel: vecEmpty(),
            acc: vecEmpty()
        };
        this.nextState = {
            pos: vecEmpty(),
            vel: vecEmpty(),
            acc: vecEmpty()
        };
        this.perceptionRange = SpoFrameSize * 3;
        this.protectionRange = SpoFrameSize / 2;
        this.animations = new Map();
        this.currState.pos = pos;
        this.nextState.pos = pos;
        this.type = "regular";
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
    setType(type) {
        this.type = type;
        this.initAnimations();
    }
    getType() {
        return this.type;
    }
    wrapAtEdge(scene) {
        if (this.nextState.pos.x < -SpoFrameSize)
            this.nextState.pos.x = scene.width;
        if (this.nextState.pos.x > scene.width)
            this.nextState.pos.x = -SpoFrameSize;
        if (this.nextState.pos.y < -SpoFrameSize)
            this.nextState.pos.y = scene.height;
        if (this.nextState.pos.y > scene.height)
            this.nextState.pos.y = -SpoFrameSize;
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
    }
    testOtherSpoWithinRange(scene, spo) {
        let rel = vecSub(spo.currState.pos, this.currState.pos);
        if (rel.x > (scene.width / 2)) {
            rel.x -= scene.width;
        }
        if (rel.x < ((-scene.width) / 2)) {
            rel.x += scene.width;
        }
        if (rel.y > (scene.height / 2)) {
            rel.y -= scene.height;
        }
        if (rel.y < ((-scene.height) / 2)) {
            rel.y += scene.height;
        }
        const distSq = rel.x * rel.x + rel.y * rel.y;
        if (distSq < (this.perceptionRange * this.perceptionRange)) {
            return rel;
        }
        return null;
    }
    move_targetSpeed() {
        const mag = vecLength(this.currState.vel);
        const diff = SpoTargetSpeed - mag;
        return vecNormalize(this.currState.vel, diff / 2);
    }
    move_separation(oSpoPos) {
        const fromTo = vecFromTo(oSpoPos, this.currState.pos);
        const dist = vecLength(fromTo);
        if (dist > this.protectionRange) {
            return vecEmpty();
        }
        return vecScale(fromTo, (1 / dist) * SpoSeparationFactor);
    }
    move_alignment(oSpoVel) {
        const fact = SpoAlignmentFactor / 1000;
        return {
            x: oSpoVel.x * fact,
            y: oSpoVel.y * fact
        };
    }
    move_cohesion(oSpoPos) {
        return vecScale(vecFromTo(this.currState.pos, oSpoPos), SpoCohesionFactor / 1000);
    }
    move_cursor(cursorPos) {
        const fromTo = vecFromTo(this.currState.pos, cursorPos);
        const len = vecLength(fromTo);
        return vecNormalize(fromTo, len * SpoCursorBiasFactor * 0.0001);
    }
    flock(scene) {
        let acc = vecEmpty();
        let numChecked = 0;
        scene.spos.forEach(spo => {
            if (this === spo)
                return;
            let rel = this.testOtherSpoWithinRange(scene, spo);
            if (rel === null)
                return;
            let abs = vecAdd(this.currState.pos, rel);
            acc = vecAdd(acc, this.move_targetSpeed());
            acc = vecAdd(acc, this.move_separation(abs));
            acc = vecAdd(acc, this.move_alignment(spo.currState.vel));
            acc = vecAdd(acc, this.move_cohesion(abs));
            acc = vecAdd(acc, this.move_cursor(CanvasMousePos));
            numChecked++;
        });
        if (numChecked === 0) {
            this.nextState.acc = vecEmpty();
        }
        else {
            this.nextState.acc = vecScale(acc, 1 / numChecked);
        }
    }
    advanceState() {
        this.nextState.vel = vecAdd(this.nextState.vel, this.nextState.acc);
        this.nextState.acc.x = 0;
        this.nextState.acc.y = 0;
        this.nextState.pos = vecAdd(this.nextState.pos, this.nextState.vel);
        this.currState.pos.x = this.nextState.pos.x;
        this.currState.pos.y = this.nextState.pos.y;
        this.currState.vel.x = this.nextState.vel.x;
        this.currState.vel.y = this.nextState.vel.y;
        this.currState.acc.x = this.nextState.acc.x;
        this.currState.acc.y = this.nextState.acc.y;
    }
    step(scene) {
        this.flock(scene);
        this.advanceState();
        this.wrapAtEdge(scene);
    }
    getAnimName() {
        let name = this.type + "_";
        let action = "walk_";
        let dirName = vecDirectionName(this.currState.vel);
        if (dirName === "none") {
            action = "stand_";
            dirName = "down";
        }
        return name + action + dirName;
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
        anim.draw(ctx, pos, size, rate);
    }
    event_mousedown(mousePos) {
    }
    event_mousemove(mousePos) {
    }
    event_mouseup(mousePos) {
    }
}
