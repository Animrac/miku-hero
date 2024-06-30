export class User {
    constructor(main, initialHeight, vidDuration) {
        this.main = main;
        this.width = 200;
        this.height = 200;
        this.xx = 0;
        this.yy = initialHeight - this.height - 80;
        this.counter = 1;
        
        this.puhplaya = new Image();
        this.walkingLoop = setInterval(() => {
            if(this.counter == 9) {this.counter = 1};
            this.puhplaya.src = 'images/rin/rin' + this.counter + '.png';
            this.counter++;
        }, 70);
        
        this.jumpDuration = 400; //how long until you stop going up (ms)
        this.jumpPower = 30; //how high you jump (weird magic number)
        this.upward = false; //flag for if jump is going upward.
        this.jumpScale = 1; //for math to make jump a parabola.
        this.jumpTime = 0; //time that the apex of jump is reached.
        this.prevTime = 0; //previous time recorded so we don't update jumps on framerate.
        this.finalJump = vidDuration - (this.jumpDuration * 3); //last timestamp we should allow a jump.
    }

    /**
     * Mark that user wants to jump.
     * @param {int} time timestamp that this function was called at.
     */
    jump(time) {
        //Only jump if there's time left to do so, and we aren't already jumping.
        if (time < this.finalJump && time > (this.jumpTime + this.jumpDuration)) {
            clearInterval(this.walkingLoop);
            this.upward = true;
            this.jumpScale = 1;
            this.jumpTime = time + this.jumpDuration;
            this.prevTime = time;
        }
    }

    /**
     * Jump logic.
     * @param {int} time timestamp this function was called at.
     * @param {number} floor the y position of the floor below us.
     * @returns 
     */
    doJump(time, floor) {
        if (time == this.prevTime) return; //If we're still on the same timestamp, leave.

        floor -= (this.height); //adjust floor given for sprite height.

        if (this.upward) { //We goin up?
            this.yy -= this.jumpPower * Math.max(0.05, this.jumpScale);
            this.jumpScale *= 0.9;
            if (this.jumpScale > 1) this.jumpScale = 1;

            if (this.jumpTime < time) {
                this.upward = false;
                this.walkingLoop = setInterval(() => {
                    if(this.counter == 9) {this.counter = 1};
                    this.puhplaya.src = 'images/rin/rin' + this.counter + '.png';
                    this.counter++;
                }, 70);
            };

        //If our jump power isn't in range of the floor, fall.
        //Jump power used instead of == equality to account for weirdness.
        } else if (Math.abs(this.yy - floor) > (this.jumpPower * 0.6)) {
            this.yy += this.jumpPower * Math.max(0.05, this.jumpScale);
            this.jumpScale /= 0.9;
            if (this.jumpScale > 1) this.jumpScale = 1;
        }
    }

    /**
     * Draws the character sprite.
     * @param {context} context main's context variable.
     */
    draw(context) {
        context.drawImage(this.puhplaya, this.xx, this.yy);
    }

}