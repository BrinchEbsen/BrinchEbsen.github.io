type ParticleSettings = {
    loop: boolean,
    lifespan: number,
    rate: number
};

class Particle implements Sprite {
    public frames: HTMLImageElement[];
    public settings: ParticleSettings;

    public anim: SpriteAnimation;

    public pos: Vec = {x: 0, y: 0};
    public vel: Vec;
    public accell: Vec;

    public lifetime: number;
    public requestDelete: boolean;

    constructor(
        frames: HTMLImageElement[],
        settings: ParticleSettings,
        anchorPos: Vec,
        vel: Vec = {x: 0, y: 0},
        accell: Vec = {x: 0, y: 0}
    ) {
        this.frames = frames;
        this.settings = settings;
        this.anchorPos = anchorPos;
        this.vel = vel;
        this.accell = accell;
        this.lifetime = 0;

        this.anim = new SpriteAnimation(
            frames,
            settings.loop,
            settings.rate
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

    step(): void {
        //Apply velocity
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        //Apply accelleration
        this.vel.x += this.accell.x;
        this.vel.y += this.accell.y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.requestDelete) return;

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
    public frames: HTMLImageElement[];
    public settings: ParticleSettings;

    public particles: Particle[];

    constructor(frames: HTMLImageElement[], settings: ParticleSettings) {
        this.frames = frames;
        this.settings = settings;

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

    addParticle(pos: Vec): Particle {
        const particleAdd = new Particle(this.frames, this.settings, pos);
        this.particles.push(particleAdd);
        return particleAdd;
    }

    addParticleRange(xMin: number, xMax: number, yMin: number, yMax: number): Particle {
        const pos: Vec = {
            x: randomFromTo(xMin, xMax),
            y: randomFromTo(yMin, yMax)
        };

        return this.addParticle(pos);
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