"use strict";
class Particle {
    constructor(frames, settings, anchorPos, vel = { x: 0, y: 0 }, accell = { x: 0, y: 0 }) {
        this.pos = { x: 0, y: 0 };
        this.frames = frames;
        this.settings = settings;
        this.anchorPos = anchorPos;
        this.vel = vel;
        this.accell = accell;
        this.lifetime = 0;
        this.anim = new SpriteAnimation(frames, settings.loop, settings.rate);
        this.requestDelete = false;
    }
    get anchorPos() {
        if (this.frames.length === 0)
            return this.pos;
        return {
            x: this.pos.x + (this.frames[0].width / 2),
            y: this.pos.y + (this.frames[0].height / 2)
        };
    }
    set anchorPos(val) {
        if (this.frames.length === 0) {
            this.pos = val;
        }
        this.pos.x = val.x - (this.frames[0].width / 2);
        this.pos.y = val.y - (this.frames[0].height / 2);
    }
    step() {
        //Apply velocity
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        //Apply accelleration
        this.vel.x += this.accell.x;
        this.vel.y += this.accell.y;
    }
    draw(ctx) {
        if (this.requestDelete)
            return;
        this.lifetime++;
        if (this.settings.lifespan >= 0) {
            if (this.lifetime > this.settings.lifespan) {
                this.requestDelete = true;
                return;
            }
        }
        if (!this.anim.running) {
            this.requestDelete = true;
            return;
        }
        this.anim.draw(ctx, this.pos);
    }
}
class ParticleSys {
    constructor(frames, settings) {
        this.frames = frames;
        this.settings = settings;
        this.particles = [];
    }
    purgeParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (particle.requestDelete) {
                this.particles.splice(i, 1);
                i--; //to account for mutated array
            }
        }
    }
    clearParticles() {
        this.particles = [];
    }
    addParticle(pos) {
        const particleAdd = new Particle(this.frames, this.settings, pos);
        this.particles.push(particleAdd);
        return particleAdd;
    }
    addParticleRange(xMin, xMax, yMin, yMax) {
        const pos = {
            x: randomFromTo(xMin, xMax),
            y: randomFromTo(yMin, yMax)
        };
        return this.addParticle(pos);
    }
    step() {
        this.particles.forEach(p => {
            p.step();
        });
    }
    draw(ctx) {
        this.purgeParticles();
        this.particles.forEach(p => {
            p.draw(ctx);
        });
    }
}
