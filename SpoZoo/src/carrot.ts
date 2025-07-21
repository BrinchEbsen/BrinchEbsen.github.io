enum CarrotState {
    InGround,
    AboveGround,
    Grabbed
};

const CarrotFrameSize = 32;

class Carrot implements Sprite {
    pos: Vec;
    state: CarrotState;
    requestDelete: boolean;

    constructor(pos: Vec, state: CarrotState) {
        this.pos = pos;
        this.state = state;
        this.requestDelete = false;
    }

    get anchorPos(): Vec {
        return {
            x: this.pos.x + 16,
            y: this.pos.y + 24 
        };
    }

    set anchorPos(val: Vec) {
        this.pos.x = val.x - 16;
        this.pos.y = val.y - 24;
    }

    get middlePos(): Vec {
        return {
            x: this.pos.x + 16,
            y: this.pos.y + 16 
        };
    }

    set middlePos(val: Vec) {
        this.pos.x = val.x - 16;
        this.pos.y = val.y - 16;
    }

    step(scene: SpoZooScene): void {
        if ((this.pos.x + CarrotFrameSize < 0) || (this.pos.x > scene.width) ||
            (this.pos.y + CarrotFrameSize < 0) || (this.pos.y > scene.height))
        {
            this.requestDelete = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        let frame: HTMLImageElement | undefined;

        if (this.state === CarrotState.InGround) {
            frame = CarrotFrames.carrotGround;
        } else {
            frame = CarrotFrames.carrot;
        }
        
        if (frame !== undefined) {
            ctx.drawImage(frame,
                Math.floor(this.pos.x),
                Math.floor(this.pos.y)
            );
        }
    }

    event_mouseDown(mousePos: Vec, theZoo: SpoZoo, checkGrab: boolean = false): void {
        if (checkGrab) {
            if (this.state === CarrotState.InGround) {
                const dist = vecDist(mousePos, this.middlePos);
                if (dist < 16) {
                    this.state = CarrotState.AboveGround;
                    theZoo.spawnGenericParticleEffect(this.middlePos, 16, 2);
                }
            } else if (this.state === CarrotState.AboveGround) {
                const dist = vecDist(mousePos, this.middlePos);
                if (dist < 16) {
                    this.state = CarrotState.Grabbed;
                    this.middlePos = mousePos;
                }
            }
        }
    }

    event_mouseMove(mousePos: Vec): void {
        if (this.state === CarrotState.Grabbed) {
            this.middlePos = mousePos;
        }
    }

    event_mouseUp(mousePos: Vec, theZoo: SpoZoo): void {
        if (this.state === CarrotState.Grabbed) {
            let closestSpo: Spo | undefined;
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