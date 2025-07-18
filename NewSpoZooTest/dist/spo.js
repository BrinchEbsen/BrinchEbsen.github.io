"use strict";
;
class Spo {
    constructor(pos, dir = { x: 0, y: 1 }, startState = 1 /* SpoState.Stand */) {
        this.animations = new Map;
        this.timer = 0;
        this.pos = pos;
        this.dir = dir;
        this.state = startState;
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
    step(scene) {
        this.state = 0 /* SpoState.Walk */;
        if (randomBool(0.3)) {
            this.randomDir();
        }
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
