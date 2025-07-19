type VelAcc = {
    vel: Vec,
    acc?: Vec
};

type PointVelAcc = {
    point: Vec,
    vel: number,
    acc?: number
};

/**
 * Global settings for a particle system.
 */
type ParticleSysParams = {
    loop?: boolean,
    lifespan?: number,
    rate?: number,
    size?: number
};

/**
 * Parameters for individual particles.
 */
type ParticleParams = {
    flyInDirection?: VelAcc,
    flyAwayFrom?: PointVelAcc,
    flyTowards?: PointVelAcc,
}

class Particle implements Sprite {
    public frames: HTMLImageElement[];
    public sysParams: ParticleSysParams;

    public anim: SpriteAnimation;

    public pos: Vec = {x: 0, y: 0};
    public params: ParticleParams;
    public size: number;

    public lifetime: number;
    public requestDelete: boolean;

    constructor(
        frames: HTMLImageElement[],
        sysParams: ParticleSysParams,
        anchorPos: Vec,
        size: number = 1,
        params: ParticleParams = {}
    ) {
        this.frames = frames;
        this.sysParams = sysParams;
        this.anchorPos = anchorPos;
        this.lifetime = 0;
        this.params = params;
        this.size = size;

        this.anim = new SpriteAnimation(
            frames,
            sysParams.loop || false,
            sysParams.rate || 1
        );

        this.requestDelete = false;
    }

    get anchorPos(): Vec {
        if (this.frames.length === 0) return this.pos;
        return {
            x: this.pos.x + (this.frames[0].width/2),
            y: this.pos.y + (this.frames[0].height/2)
        };
    }
    set anchorPos(val: Vec) {
        if (this.frames.length === 0) {
            this.pos = val;
        }

        this.pos.x = val.x - (this.frames[0].width/2);
        this.pos.y = val.y - (this.frames[0].height/2);
    }

    applyFlyInDirection(param: VelAcc): void {
        this.pos.x += param.vel.x;
        this.pos.y += param.vel.y;

        if (param.acc) {
            param.vel.x += param.acc.x;
            param.vel.y += param.acc.y;
        }
    }

    applyFlyAwayFrom(param: PointVelAcc): void {
        const dir = vecFromTo(param.point, this.anchorPos);
        
        const vel = vecNormalize(dir, param.vel);

        this.pos.x += vel.x;
        this.pos.y += vel.y;

        if (param.acc) {
            param.vel += param.acc;
        }
    }

    applyFlyTowards(param: PointVelAcc): void {
        const dir = vecFromTo(this.anchorPos, param.point);
        
        const vel = vecNormalize(dir, param.vel);

        this.pos.x += vel.x;
        this.pos.y += vel.y;

        if (param.acc) {
            param.vel += param.acc;
        }
    }

    step(): void {
        if (this.params.flyInDirection)
            this.applyFlyInDirection(this.params.flyInDirection);

        if (this.params.flyAwayFrom)
            this.applyFlyAwayFrom(this.params.flyAwayFrom);

        if (this.params.flyTowards)
            this.applyFlyTowards(this.params.flyTowards);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.requestDelete) return;

        this.lifetime++;

        if (this.sysParams.lifespan) {
            if (this.sysParams.lifespan >= 0) {
                if (this.lifetime > this.sysParams.lifespan) {
                    this.requestDelete = true;
                    return;
                }
            }
        }

        if (!this.anim.running) {
            this.requestDelete = true;
            return;
        }

        this.anim.draw(ctx, this.pos, this.size);
    }
}

class ParticleSys {
    public frames: HTMLImageElement[];
    public params: ParticleSysParams;

    public particles: Particle[];

    constructor(frames: HTMLImageElement[], params: ParticleSysParams) {
        this.frames = frames;
        this.params = params;

        this.particles = [];
    }

    purgeParticles(): void {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];

            if (particle.requestDelete) {
                this.particles.splice(i, 1);
                i--; //to account for mutated array
            }
        }
    }

    clearParticles(): void {
        this.particles = [];
    }

    addParticle(pos: Vec, params: ParticleParams = {}): Particle {
        let size = 1;
        if (this.params.size) size = this.params.size;

        const particleAdd = new Particle(this.frames, this.params, pos, size, params);
        this.particles.push(particleAdd);
        return particleAdd;
    }

    addParticleRange(
        xMin: number,
        xMax: number,
        yMin: number,
        yMax: number,
        params: ParticleParams = {}
    ): Particle {
        const pos: Vec = {
            x: randomFromTo(xMin, xMax),
            y: randomFromTo(yMin, yMax)
        };

        return this.addParticle(pos, params);
    }

    step(): void {
        this.particles.forEach(p => {
            p.step();
        });
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.purgeParticles();

        this.particles.forEach(p => {
            p.draw(ctx);
        });
    }
}