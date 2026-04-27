"use strict";
var CarrotState;
(function (CarrotState) {
    CarrotState[CarrotState["InGround"] = 0] = "InGround";
    CarrotState[CarrotState["AboveGround"] = 1] = "AboveGround";
    CarrotState[CarrotState["Grabbed"] = 2] = "Grabbed";
})(CarrotState || (CarrotState = {}));
;
const CarrotFrameSize = 32;
class Carrot {
    constructor(pos, state) {
        this.pos = pos;
        this.state = state;
        this.requestDelete = false;
    }
    get anchorPos() {
        return {
            x: this.pos.x + 16,
            y: this.pos.y + 24
        };
    }
    set anchorPos(val) {
        this.pos.x = val.x - 16;
        this.pos.y = val.y - 24;
    }
    get middlePos() {
        return {
            x: this.pos.x + 16,
            y: this.pos.y + 16
        };
    }
    set middlePos(val) {
        this.pos.x = val.x - 16;
        this.pos.y = val.y - 16;
    }
    step(scene) {
        if ((this.pos.x + CarrotFrameSize < 0) || (this.pos.x > scene.width) ||
            (this.pos.y + CarrotFrameSize < 0) || (this.pos.y > scene.height)) {
            this.requestDelete = true;
        }
    }
    draw(ctx) {
        let frame;
        if (this.state === CarrotState.InGround) {
            frame = CarrotFrames.carrotGround;
        }
        else {
            frame = CarrotFrames.carrot;
        }
        if (frame !== undefined) {
            ctx.drawImage(frame, Math.floor(this.pos.x), Math.floor(this.pos.y));
        }
    }
    event_mouseDown(mousePos, theZoo, checkGrab = false) {
        if (checkGrab) {
            if (this.state === CarrotState.InGround) {
                const dist = vecDist(mousePos, this.middlePos);
                if (dist < 16) {
                    this.state = CarrotState.AboveGround;
                    theZoo.spawnGenericParticleEffect(this.middlePos, 16, 2);
                }
            }
            else if (this.state === CarrotState.AboveGround) {
                const dist = vecDist(mousePos, this.middlePos);
                if (dist < 16) {
                    this.state = CarrotState.Grabbed;
                    this.middlePos = mousePos;
                }
            }
        }
    }
    event_mouseMove(mousePos) {
        if (this.state === CarrotState.Grabbed) {
            this.middlePos = mousePos;
        }
    }
    event_mouseUp(mousePos, theZoo) {
        if (this.state === CarrotState.Grabbed) {
            let closestSpo;
            let closestDist = 10000;
            theZoo.scene.spos.forEach(s => {
                const dist = vecDist(s.middlePos, this.middlePos);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestSpo = s;
                }
            });
            let gotEaten = false;
            if (closestSpo !== undefined) {
                gotEaten = closestSpo.testFeedCarrot(this, theZoo);
            }
            if (gotEaten)
                this.requestDelete = true;
            else
                this.state = CarrotState.AboveGround;
        }
    }
}
