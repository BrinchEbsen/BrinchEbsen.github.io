"use strict";
class Particle {
    constructor(frames, sysParams, anchorPos, size = 1, params = {}) {
        this.pos = { x: 0, y: 0 };
        this.frames = frames;
        this.sysParams = sysParams;
        this.anchorPos = anchorPos;
        this.lifetime = 0;
        this.params = params;
        this.size = size;
        this.anim = new SpriteAnimation(frames, sysParams.loop || false, sysParams.rate || 1);
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
    applyFlyInDirection(param) {
        this.pos.x += param.vel.x;
        this.pos.y += param.vel.y;
        if (param.acc) {
            param.vel.x += param.acc.x;
            param.vel.y += param.acc.y;
        }
    }
    applyFlyAwayFrom(param) {
        const dir = vecFromTo(param.point, this.anchorPos);
        const vel = vecNormalize(dir, param.vel);
        this.pos.x += vel.x;
        this.pos.y += vel.y;
        if (param.acc) {
            param.vel += param.acc;
        }
    }
    applyFlyTowards(param) {
        const dir = vecFromTo(this.anchorPos, param.point);
        const vel = vecNormalize(dir, param.vel);
        this.pos.x += vel.x;
        this.pos.y += vel.y;
        if (param.acc) {
            param.vel += param.acc;
        }
    }
    step() {
        if (this.params.flyInDirection)
            this.applyFlyInDirection(this.params.flyInDirection);
        if (this.params.flyAwayFrom)
            this.applyFlyAwayFrom(this.params.flyAwayFrom);
        if (this.params.flyTowards)
            this.applyFlyTowards(this.params.flyTowards);
    }
    draw(ctx) {
        if (this.requestDelete)
            return;
        this.lifetime++;
        if (this.sysParams.lifespan !== undefined) {
            if (this.lifetime > this.sysParams.lifespan) {
                this.requestDelete = true;
                return;
            }
            if (this.sysParams.startFadeOut !== undefined) {
                if (this.lifetime >= this.sysParams.startFadeOut) {
                    const fadeDuration = this.sysParams.lifespan - this.sysParams.startFadeOut;
                    const currentDuration = this.lifetime - this.sysParams.startFadeOut;
                    ctx.globalAlpha = 1 - (currentDuration / fadeDuration);
                }
            }
        }
        if (!this.anim.running) {
            this.requestDelete = true;
            return;
        }
        this.anim.draw(ctx, this.pos, this.size);
        ctx.globalAlpha = 1;
    }
}
class ParticleSys {
    constructor(frames, params) {
        this.frames = frames;
        this.params = params;
        this.particles = [];
        if (!this.validateParams())
            throw new Error("Invalid params for particle system.");
    }
    validateParams() {
        if (this.params.lifespan !== undefined) {
            if (this.params.lifespan <= 0)
                return false;
            if (this.params.startFadeOut !== undefined)
                if (this.params.startFadeOut > this.params.lifespan)
                    return false;
        }
        else {
            if (this.params.startFadeOut !== undefined)
                return false;
        }
        if (this.params.rate !== undefined)
            if (this.params.rate <= 0)
                return false;
        if (this.params.size !== undefined)
            if (this.params.size <= 0)
                return false;
        return true;
    }
    purgeParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (particle.requestDelete) {
                this.particles.splice(i, 1);
                i--;
            }
        }
    }
    clearParticles() {
        this.particles = [];
    }
    addParticle(pos, params = {}) {
        let size = 1;
        if (this.params.size)
            size = this.params.size;
        const particleAdd = new Particle(this.frames, this.params, pos, size, params);
        this.particles.push(particleAdd);
        return particleAdd;
    }
    addParticleRange(xMin, xMax, yMin, yMax, params = {}) {
        const pos = {
            x: randomFromTo(xMin, xMax),
            y: randomFromTo(yMin, yMax)
        };
        return this.addParticle(pos, params);
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
