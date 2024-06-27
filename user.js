export class User {
    constructor(main, initialHeight) {
        this.main = main;
        this.width = 200;
        this.height = 200;
        this.xx = 0;
        this.yy = initialHeight - this.height - 50;

        this.puhplaya = new Image();
        this.puhplaya.src = "./images/rin.gif";

        this.jumpPower = 30; //how high you jump (weird magic number)
        this.jumpDuration = 400; //how long until you stop going up (ms)

        this.upward = false;
        this.jumpScale = 1;
        this.jumpTime = 0;
        this.prevTime = 0;
    }

    jump(time) {
        this.upward = true;
        this.jumpScale = 1;
        this.jumpTime = time + this.jumpDuration;
        this.prevTime = time;
    }

    doJump(time, floor) {
        if (time == this.prevTime) return;
        floor -= (this.height); //adjust floor given for sprite height.
        if (this.upward) {
            this.yy -= this.jumpPower * Math.max(0.05, this.jumpScale);
            this.jumpScale *= 0.9;
            if (this.jumpTime < time) this.upward = false;
        } else if (Math.abs(this.yy - floor) > this.jumpPower) {
            this.yy += this.jumpPower * Math.max(0.05, this.jumpScale);
            this.jumpScale /= 0.9;
        }
    }

    draw(context) {
        context.drawImage(this.puhplaya, this.xx, this.yy);
    }

}