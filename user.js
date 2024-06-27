export class User {
    constructor(main) {
        this.main = main;
        this.width = 200;
        this.height = 200;
        this.x = 0;
        this.y = 0;
        this.image = document.getElementById('puhplaya');
    }

    //unsure why i can't call this without it breaking
    jump() {
        console.log("jump");
        this.y+=50;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y);
    }

}