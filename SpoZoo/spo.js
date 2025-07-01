class Spo {
    createAnimations() {
        this.animations = {};

        for(let i = 0; i < animNames.length; i++) {
            this.animations[animNames[i].name] =
                new Animation(animNames[i].name, animNames[i].rate);
        }
    }

    constructor(x, y, startState = "stand", startDir = [0, 1]) {
        this.x = x;
        this.y = y;
        this.state = startState;
        this.dir = startDir;
        this.speed = 2;

        this.setTimer();
        this.createAnimations();
    }

    setTimer(val = randomFromTo(10, 240)) {
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

    clipInBounds() {
        let moved = false;

        if (this.x < 0) {
            this.x = 0;
            moved = true;
        }
        if (this.x > canvas.width-frameSize) {
            this.x = canvas.width-frameSize;
            moved = true;
        }
        if (this.y < 0) {
            this.y = 0;
            moved = true;
        }
        if (this.y > canvas.height-frameSize) {
            this.y = canvas.height-frameSize;
            moved = true;
        }

        return moved;
    }

    checkWrapScreen() {
        if (this.x < -frameSize) {
            this.x = canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = -frameSize;
        }
        if (this.y < -frameSize) {
            this.y = canvas.height;
        }
        if (this.y > canvas.height) {
            this.y = -frameSize;
        }
    }

    pickRandomDir() {
        do {
            this.dir = [
                Math.floor(randomFromTo(-1, 2)),
                Math.floor(randomFromTo(-1, 2))
            ];
        } while (this.dir[0] == 0 && this.dir[1] == 0);
    }

    handleWalk() {
        this.x += this.dir[0] * this.speed;
        this.y += this.dir[1] * this.speed;
        
        //if (this.clipInBounds()) {
        //    this.state = "stand";
        //    return;
        //}

        this.checkWrapScreen();

        if (this.tickTimer()) {
            this.state = "stand";
            this.setTimer();
            return;
        }
    }

    handleStand() {
        if (this.tickTimer()) {
            if (Math.random() < 0.002) {
                this.state = "spin";
                this.setTimer(Math.floor(randomFromTo(32, 65)));
            } else {
                this.state = "walk";
                this.pickRandomDir();
                this.setTimer();
            }
        }
    }

    handleSpin() {
        if (this.tickTimer()) {
            this.state = "stand";
            this.setTimer();
        }
    }

    move() {
        switch(this.state) {
            case "walk":
                this.handleWalk();
                break;
            case "stand":
                this.handleStand();
                break;
            case "spin":
                this.handleSpin();
                break;
        }
    }

    getGenericAnimName() {
        let animName = this.state+"_";

        switch(this.dir[1]) {
            case -1:
                animName += "up";
                break;
            case 1:
                animName += "down";
                break;
            default: break;
        }

        switch(this.dir[0]) {
            case -1:
                animName += "left";
                break;
            case 1:
                animName += "right";
                break;
            default: break;
        }

        return animName;
    }

    getSpinAnimFrame() {
        let cycle = this.timer % 16;
        cycle = Math.floor(cycle/2);

        switch (cycle) {
            case 0: return "stand_up";
            case 1: return "stand_upright";
            case 2: return "stand_right";
            case 3: return "stand_downright";
            case 4: return "stand_down";
            case 5: return "stand_downleft";
            case 6: return "stand_left";
            case 7: return "stand_upleft";
            default: return "stand_up";
        }
    }

    getAnimName() {
        switch(this.state) {
            case "stand":
                return this.getGenericAnimName();
            case "walk":
                return this.getGenericAnimName();
            case "spin":
                return this.getSpinAnimFrame();
        }
    }

    draw() {
        const anim = this.getAnimName();
        if (this.animations[anim] == null) {
            console.error(anim);
            return;
        }
        this.animations[anim].draw(this.x, this.y);
    }

    get offScreen() {
        return (this.x <= -frameSize && this.x >= canvas.width) &&
               (this.y <= -frameSize && this.y >= canvas.height)
    }

    randomPosition() {
        this.x = randomFromTo(0, canvas.width-frameSize);
        this.y = randomFromTo(0, canvas.height-frameSize);
    }

    randomStartPosition() {
        if (Math.random() > 0.5) {
            this.x = Math.random() > 0.5 ? -frameSize : canvas.width;
            this.y = randomFromTo(-frameSize, canvas.height);
        } else {
            this.y = Math.random() > 0.5 ? -frameSize : canvas.height;
            this.x = randomFromTo(-frameSize, canvas.width);
        }
    }
}