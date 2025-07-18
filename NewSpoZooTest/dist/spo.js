"use strict";
;
const SpoWalkBackInBoundsBuffer = 40;
const SpoSpinChance = 0.002;
class Spo {
    constructor(pos, dir = { x: 0, y: 1 }, startState = 1 /* SpoState.Stand */) {
        this.target = { x: 0, y: 0 };
        this.animations = new Map;
        this.timer = 0;
        this.pos = pos;
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
        if (!SpoTypes.includes(type))
            throw new Error(`Type ${type} is not a valid Spo type!`);
        this.type = type;
        this.initAnimations();
    }
    randomDir() {
        const oneEighthAng = Math.PI / 4;
        const ang = oneEighthAng * randomIntFromTo(0, 8) - Math.PI;
        this.dir = {
            x: Math.sin(ang),
            y: Math.cos(ang)
        };
    }
    turn(left, amount = 1) {
        const oneEighthAng = Math.PI / 4;
        const ang = oneEighthAng * amount;
        this.setAng(ang);
    }
    setAng(ang) {
        this.dir = {
            x: Math.cos(ang) * this.dir.x - Math.sin(ang) * this.dir.y,
            y: Math.sin(ang) * this.dir.x + Math.cos(ang) * this.dir.y,
        };
    }
    takeStep(speedModif = 1) {
        this.dir = vecNormalize(this.dir);
        this.pos.x += this.dir.x * this.speed * speedModif;
        this.pos.y += this.dir.y * this.speed * speedModif;
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
        console.log("I'm walkin' back!");
        this.makeWalkToPoint(walkTo);
    }
    step(scene) {
        switch (this.state) {
            case 0 /* SpoState.Walk */:
                this.takeStep();
                if (this.tickTimer())
                    this.makeStand();
                break;
            case 1 /* SpoState.Stand */:
                if (this.tickTimer()) {
                    if (randomBool(SpoSpinChance)) {
                        this.makeSpin();
                    }
                    else {
                        this.makeWalkRandomDirection();
                    }
                }
                break;
            case 3 /* SpoState.Spin */:
                if (this.timer % 2 == 0)
                    this.turn(false);
                if (this.tickTimer())
                    this.makeStand();
                break;
            case 4 /* SpoState.WalkToPoint */:
                this.dir = vecFromTo(this.anchorPos, this.target);
                this.takeStep();
                if (vecDist(this.anchorPos, this.target) < this.speed) {
                    this.makeStand();
                }
                break;
        }
        this.testPastEdge(scene);
    }
    getAnimName() {
        let name = this.type + "_";
        switch (this.state) {
            case 0 /* SpoState.Walk */:
            case 2 /* SpoState.Flee */:
            case 4 /* SpoState.WalkToPoint */:
                name += "walk_";
                break;
            case 1 /* SpoState.Stand */:
            case 3 /* SpoState.Spin */:
            case 5 /* SpoState.StandStill */:
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
        anim.draw(ctx, this.pos);
    }
}
