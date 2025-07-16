class Spo {
    createAnimations() {
        this.animations = {};

        for(let i = 0; i < animNames.length; i++) {
            this.animations[animNames[i].name] =
                new Animation(animNames[i].name, animNames[i].rate);
            this.animations["gold_"+animNames[i].name] =
                new Animation("gold_"+animNames[i].name, animNames[i].rate);
        }
    }

    constructor(x, y, startState = "stand", startDir = [0, 1]) {
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.state = startState;
        this.dir = startDir;
        this.speed = 2;
        this.golden = false;

        this.center = {x: 64, y: 80};

        this.target = {
            x: 0,
            y: 0,
            dir: [0, 1]
        };

        this.setTimer();
        this.createAnimations();
    }

    get centerX() {
        return this.x + Math.floor(frameSize/2);
    }
    set centerX(val) {
        this.x = val - frameSize/2;
    }
    get centerY() {
        return this.y + Math.floor(frameSize/2);
    }
    set centerY(val) {
        this.y = val - frameSize/2;
    }

    get inStateThatMoves() {
        return this.state == "walk"
            || this.state == "flee"
            || this.state == "walktopoint";
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
        let wrapped = false;

        if (this.x < -frameSize) {
            this.x = canvas.width;
            wrapped = true;
        }
        if (this.x > canvas.width) {
            this.x = -frameSize;
            wrapped = true;
        }
        if (this.y < -frameSize) {
            this.y = canvas.height;
            wrapped = true;
        }
        if (this.y > canvas.height) {
            this.y = -frameSize;
            wrapped = true;
        }

        if (wrapped) {
            if (this.golden) {
                this.golden = false;
            } else {
                if (Math.random() < goldenChance) {
                    this.golden = true;
                }
            }
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

    turn(right = true, times = 1) {
        for (let i = 0; i < times; i++) {
            if (this.dir[0] == -1) {
                switch (this.dir[1]) {
                    case -1: //Up-left (-1, -1)
                        this.dir = right ? [0, -1] : [-1, 0]; return;
                    case 0: //Left (-1, 0)
                        this.dir = right ? [-1, -1] : [-1, 1]; return;
                    case 1: //Down left (-1, 1)
                        this.dir = right? [-1, 0] : [0, 1]; return;
                }
            } else if (this.dir[0] == 0) {
                switch (this.dir[1]) {
                    case -1: //Up (0, -1)
                        this.dir = right ? [1, -1] : [-1, -1]; return;
                    case 0: //invalid (0, 0)
                        this.dir = [0, 1]; return;
                    case 1: //Down (0, 1)
                        this.dir = right? [-1, 1] : [1, 1]; return;
                }
            } else {
                switch (this.dir[1]) {
                    case -1: //Up-right (1, -1)
                        this.dir = right ? [1, 0] : [0, -1]; return;
                    case 0: //Right (1, 0)
                        this.dir = right ? [1, 1] : [1, -1]; return;
                    case 1: //Down-right (1, 1)
                        this.dir = right? [0, 1] : [1, 0]; return;
                }
            }
        }
    }

    makeRandomTurns(times = 1) {
        this.turn(Math.random() > 0.5, times);
    }

    walkTo(x, y, finalDir) {
        if (this.state == "grabbed") return;

        this.target.x = x;
        this.target.y = y;
        this.target.dir = finalDir;

        this.state = "walktopoint";
    }

    takeStep(distMult = 1) {
        this.lastX = this.x;
        this.lastY = this.y;

        let moveDir = [
            this.dir[0],
            this.dir[1]
        ];

        //If diagonal, divide by root 2 to make distance consistent
        if (Math.abs(moveDir[0]) == 1 && Math.abs(moveDir[1]) == 1) {
            moveDir[0] /= Math.SQRT2;
            moveDir[1] /= Math.SQRT2;
        }
        
        this.x += moveDir[0] * this.speed * distMult;
        this.y += moveDir[1] * this.speed * distMult;
    }

    checkMoved() {
        return (this.lastX != this.x || this.lastY != this.y);
    }

    handleWalk() {
        this.takeStep();

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
        if ((this.timer % 2) == 0) {
            this.turn(true);
        }

        if (this.tickTimer()) {
            this.state = "stand";
            this.setTimer();
        }
    }

    handleFlee() {
        this.takeStep(2);

        if (Math.random() < 0.1) {
            this.makeRandomTurns();
        }

        this.checkWrapScreen();

        if (this.tickTimer()) {
            this.state = "stand";
            this.setTimer();
            return;
        }
    }

    handleWalkToPoint() {
        const tolerance = 6;

        if (dist(this.centerX, this.centerY, this.target.x, this.target.y) < tolerance) {
            this.dir = this.target.dir;
            this.centerX = this.target.x;
            this.centerY = this.target.y;
            this.state = "standstill";
            return;
        }

        if (Math.abs(this.centerX - this.target.x) > (tolerance/2)) {
            if (this.centerX < this.target.x) {
                this.dir = [1, 0];
            } else {
                this.dir = [-1, 0];
            }
        } else {
            if (this.centerY < this.target.y) {
                this.dir = [0, 1];
            } else {
                this.dir = [0, -1];
            }
        }

        this.takeStep();
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
            case "flee":
                this.handleFlee();
                break;
            case "walktopoint":
                this.handleWalkToPoint();
                break;
            case "standstill":
                break;
        }
    }

    getDirectionName() {
        let name = "";

        switch(this.dir[1]) {
            case -1:
                name += "up";
                break;
            case 1:
                name += "down";
                break;
            default: break;
        }

        switch(this.dir[0]) {
            case -1:
                name += "left";
                break;
            case 1:
                name += "right";
                break;
            default: break;
        }

        return name;
    }

    getGenericAnimName() {
        return this.state+"_"+this.getDirectionName();
    }

    getAnimName() {
        let name = this.golden ? "gold_" : "";

        switch(this.state) {
            case "stand":
                name += this.getGenericAnimName();
                break;
            case "walk":
                name += this.getGenericAnimName();
                break;
            case "spin":
                name += "stand_"+this.getDirectionName();
                break;
            case "grabbed":
                name += "walk_"+this.getDirectionName();
                break;
            case "flee":
                name += "walk_"+this.getDirectionName();
                break;
            case "walktopoint":
                name += "walk_"+this.getDirectionName();
                break;
            case "standstill":
                name += "stand_"+this.getDirectionName();
                break;
        }

        return name;
    }

    draw() {
        const anim = this.getAnimName();
        if (this.animations[anim] == null) {
            console.error(anim);
            return;
        }

        let speed = 1;
        if (this.state == "grabbed" || this.state == "flee") {
            speed = 2;
        }
        let size = 1;
        if (this.state == "grabbed") {
            size = 1.4;
        }

        //if (this.golden) {
        //    ctx.filter = "hue-rotate(150deg) brightness(1.8)";
        //}

        this.animations[anim].draw(this.x, this.y, speed, size);

        //if (this.golden) {
        //    ctx.filter = "none";
        //}

        //if (DEBUG) {
        //    ctx.fillStyle = "white";
        //    ctx.fillText(`cX: ${this.centerX}, cY: ${this.centerY}`, this.x, this.y);
        //}
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

    scatterFrom(x, y) {
        if (this.state == "grabbed" || this.state == "flee") return;

        if (dist(this.centerX, this.centerY, x, y) > 400) return;

        this.state = "walk";
        this.setTimer();
        this.dir = simpleUnitVectorTo(this.centerX, this.centerY, x, y);
        this.dir = [-this.dir[0], -this.dir[1]]; //invert
    }

    makeSpin(duration) {
        this.state = "spin";
        this.setTimer(duration);
    }

    stopWalking() {
        this.state = "stand";
        this.setTimer();
    }

    lookAtIfStanding(x, y) {
        if (dist(this.centerX, this.centerY, x, y) > 200) return;

        if (this.state == "stand") {
            //this.setTimer();
            this.dir = simpleUnitVectorTo(this.centerX, this.centerY, x, y);
        }
    }

    releaseGrab() {
        this.state = "flee";
        this.setTimer(240);
    }

    inRange(x, y) {
        if (
            (x < this.x+spoBoundsBox.x+spoBoundsBox.w) &&
            (x > this.x+spoBoundsBox.x) &&
            (y < this.y+spoBoundsBox.y+spoBoundsBox.h) &&
            (y > this.y+spoBoundsBox.y)
        ) {
            return true;
        } else {
            return false;
        }
    }

    mouseDown(x, y) {
        if (this.inRange(x, y)) {
            this.state = "grabbed";
            this.centerX = x;
            this.centerY = y;
        }
    }

    mouseUp() {
        if (this.state == "grabbed") this.releaseGrab();
    }

    mouseLeave() {
        if (this.state == "grabbed") this.releaseGrab();
    }

    mouseMoved(x, y) {
        if (this.state != "grabbed") return;

        this.centerX = x;
        this.centerY = y;
    }
}