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

    setTimer(val = randomFromTo(30, 120)) {
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
        
        if (this.clipInBounds()) {
            this.state = "stand";
            return;
        }

        if (this.tickTimer()) {
            this.state = "stand";
            this.setTimer();
            return;
        }
    }

    handleStand() {
        if (this.tickTimer()) {
            this.state = "walk";
            this.pickRandomDir();
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
        }
    }

    getAnimName() {
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

    pickNewStartPosition() {
        if (Math.random() > 0.5) {
            this.x = -frameSize;
            this.y = randomFromTo(-frameSize, canvas.height);
        } else {
            this.y = -frameSize;
            this.x = randomFromTo(-frameSize, canvas.width);
        }
    }
}