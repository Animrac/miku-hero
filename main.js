import { Player } from "textalive-app-api";
import { User } from "./user.js";

class Main {

    constructor() {
        this.step = 80; //How many ms make up one vertical slice (aka, a square)
        this.blockSize = 40; //Horizontal space taken up by each vertical slice.
        this.songDuration = 200_000; //Song length in ms. (Hardcoded close-enough value atm)
        
        //init canvas
        this.canvasInit();
        this.lyricFloor = this.canvas.height - 220 //Set lowest point for lyrics
        //this.lyricFloor = this.canvas.height - 120 //Set lowest point for lyrics

        //init player
        this.playerInit();

        //init volume
        this.volumeInit();

        //init buttons
        this.buttonInit();

        //allow for dynamic width
        window.addEventListener("resize", () => this.resizeCanvas());

        this.bgInit();

        this.user = new User(this, this.lyricFloor, this.songDuration);

        //kickstart frame updates
        this.updateFrame();
    }

    /***
     * Initializes the viewable canvas properties.
     */
    canvasInit() {
        this.canvasDiv = document.getElementById("canvasDiv");
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");

        this.resizeCanvas();
    }

    /***
     * Resizes the canvas as the player changes the size of the window.
     */
    resizeCanvas() {
        this.canvas.width = this.canvasDiv.clientWidth;
        this.canvas.height = this.canvasDiv.clientHeight;
        this.context.font = "40px PixelMplus10-Regular";
    }

    /***
     * Initializes the player object and listeners.
     */
    playerInit() {
        this.player = new Player({
            app: { token: "JY0mLoHiX3lPTJaS" },
            mediaElement: document.getElementById("media"),
            mediaSourceElement: document.getElementById("videoDiv")
        });

        this.player.addListener({
            onAppReady: (app) => this.loadSong(app),
            onVideoReady: (v) => {
                this.loadLyrics(v);
                // document.getElementById("artist").textContent = this.player.data.song.artist.name;
                // document.getElementById("song").textContent = this.player.data.song.name;
            },
            onTimeUpdate: (pos) => this.updateTime(pos),
            onTimerReady: () => {
                document.getElementById("pauseOverlay").style.display = "none";
                document.getElementById("loadingOverlay").style.display = "none";
            }
        });
    }

    /***
     * Initializes the volume slider.
     */
    volumeInit() {
        this.volumeSlider = document.getElementById("volumeSlider").addEventListener("input", (event) => {
            this.player.volume = parseFloat(event.target.value);
        });
        //initial volume
        this.player.volume = 3;
    }

    /***
     * Initializes the play button.
     */
    buttonInit() {
        let playOverlay = document.getElementById("playOverlay");
        let pauseOverlay = document.getElementById("pauseOverlay");
        let gameOverOverlay = document.getElementById("gameOverOverlay");
        let statsDiv = document.getElementById("statsDiv");
        let buttonPause = document.getElementById("buttonPause");
        let buttonPlay = document.getElementById("buttonPlay");
        let buttonReset = document.getElementById("buttonReset");
        let buttonHelp = document.getElementById("buttonHelp");
        let canvas = document.getElementById("canvas");
        
        let buttonHero  = document.getElementById("buttonHero");
        this.heroMode = false;

        buttonHero.addEventListener("click", () => {
            this.heroMode = !this.heroMode;
            //testing stuff, add reset at current point logic here
            console.log(this.heroMode);
            gameOverOverlay.style.display = "none"
            this.toPlay();
        });

        buttonPause.disabled = true;
        buttonPlay.disabled = true;
        buttonPlay.style.opacity = 0.5;
        buttonPause.style.opacity = 0.5;

        playOverlay.addEventListener("click", () => {
            this.player.requestPlay();
            playOverlay.style.display = "none"
            statsDiv.style.display = "flex"
            buttonPlay.style.opacity = 0.5;
            buttonPause.style.opacity = 1;
            buttonPause.disabled = false;
            buttonPlay.disabled = false;
            const bars = document.querySelectorAll(".bar");
            for (let i = 0; i < bars.length; i++)
                bars.forEach(each => each.style.animationDuration = `${Math.random() * (0.25) + 0.25}s`);
        });

        buttonPause.addEventListener("click", () => {
            this.toPause();
        });

        buttonPlay.addEventListener("click", () => {
            this.toPlay();
        });

        buttonReset.addEventListener("click", () => {
            window.location.reload();
        });

        buttonHelp.addEventListener("click", () => {
            this.toPause();
            alert("Miku Programming Contest 2024\n\nControls:\nLeft-click the game window to jump!\nSurvive until the end of the game to save your beloved Len.\n\nCreated by:\nseburoh + MintGlow");
            // alert("Miku Programming Contest 2024\n\nControls:\nLeft-click the game window to jump!\nSurvive and make it to the end of the game to save your beloved Len.\n\nCreated by:\nseburoh + MintGlow\n\nSong title: \n" + this.player.data.song.name + "\n\nSong by:\n" + this.player.data.song.artist.name);
        });

        //click the thing on top of the canvas two jwump owo
        statsDiv.addEventListener("click", () => {
            if (this.player.isPlaying) {
                this.user.jump(this.timeStamp);
            }
        });
    }

    bgInit() {
        this.bg = new Image();
        this.bg.src = "images/mountainorsomething.png";
        this.scrollSpeed = 1;
        this.bgWidth = 0;
    }

    /***
     * Loads the correct song (SUPERHERO / めろくる).
     */
    loadSong(app) {
        if (!app.songUrl) {
            this.player.createFromSongUrl("https://piapro.jp/t/hZ35/20240130103028", {
                video: {
                    // 音楽地図訂正履歴
                    beatId: 4592293,
                    chordId: 2727635,
                    repetitiveSegmentId: 2824326,
                    // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FhZ35%2F20240130103028
                    lyricId: 59415,
                    lyricDiffId: 13962
                }
            });
        }
    }

    /***
     * Loads in each lyric/character.
     */
    loadLyrics(vid) {
        let lyrics = [];
        if (vid.firstChar) {
            let ly = vid.firstChar;
            while (ly) {
                lyrics.push(new Lyric(ly));
                ly = ly.next;
            }
        }
        this.lyrics = lyrics;
        this.setLyricPositions();
        this.adjustLyricPositions();
    }

    /**
     * Randomly sets block positions.
     */
    setLyricPositions() {
        let jumpMod = this.user.jumpPower * 30; //Change this to affect what the jumps look like

        let counter = 0;
        let rollingPos = this.lyricFloor;
        let blockCount = this.songDuration / this.step;
        this.blockPos = [];

        for (let i = 0; i < 10; i++) {
            this.blockPos.push(this.lyricFloor);
        }

        //set positions for lyrics, ignore first & last 10.
        for (let i = 10; i < blockCount - 10; i++) {

            //70% chance to set new position if this is the 21st in a row.
            if (counter > 20 && Math.random() < 0.7) {
                let heightMod = Math.min(0.2, Math.random());
                if (Math.random() < 0.5) heightMod *= -1;

                let newPos = rollingPos - (heightMod * jumpMod);

                //keep in bounds.
                if (newPos > this.lyricFloor) {
                    newPos -= Math.abs(heightMod * jumpMod);
                } else if (newPos < 120) {
                    newPos += Math.abs(heightMod * jumpMod);
                }

                //set new position to use, reset counter
                rollingPos = newPos;
                counter = 0;
            }

            //set the position, increment counter
            this.blockPos.push(rollingPos);
            counter++;
        }
    }

    /**
     * Manual adjustment of block positions.
     */
    adjustLyricPositions() {
        //Hi cutie.
    }

    /***
     * Do updates based on time (in ms).
     */
    updateTime(timeStamp) {
        this.timeStamp = timeStamp;
        let seconds = Math.floor((this.timeStamp / 1000) % 60);
        let minutes = Math.floor((this.timeStamp / (1000 * 60)) % 60);
        if (this.playFinish != true) {
            // eventually i think it'd be cool if there were different worlds/levels, so those would be displayed when the time hits 15 or 30 seconds everytime
            if (seconds < 10) {
                document.getElementById("stats").textContent = "0" + minutes + ":0" + seconds;
            } else {        
                document.getElementById("stats").textContent = "0" + minutes + ":" + seconds;
            }
        } else {
            document.getElementById("stats").textContent = "FIN";
        }

        //If we're within 3s of end, mark it.
        if (Math.abs(this.timeStamp - this.songDuration) < 2000) this.playFinish = true;
    }

    /***
     * Do updates based on frames (in how-good-your-monitor-is).
     */
    updateFrame() {
        //What to draw during normal play.
        if ((this.player.isPlaying || this.timeStamp > 0) && !this.playFinish) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); //Clear screen.
            this.showBg();
            this.showLyric();
            this.showUser();

            //What to draw when play is complete.
        } else if (this.playFinish) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); //Clear screen.
            this.showBg();
            this.showLyric();
            this.showUser();
            this.context.fillText('Thank you for playing!', this.canvas.width * 0.5, this.canvas.height * 0.5);
        }

        //may i have another?
        window.requestAnimationFrame(() => this.updateFrame());
    }

    /**
     * Draws on canvas.
     */
    showLyric() {
        if (!this.lyrics) return; //Don't do stuff if no lyrics have been loaded.

        let delay = 200; //amount of time in ms to delay from impact
        let startPixel = this.timeToPixel(this.timeStamp - delay); //Convert timestamp to pixel for cleaner math.
        let blockCounter = Math.floor(startPixel / this.blockSize); //Keep track of which block position to use.
        this.playerBlock = this.blockPos[blockCounter + 3];

        //Determine first lyric that will be shown
        let bufferedTime = this.timeStamp - delay - this.step; //Be generous in what lyric we grab first.
        let lyi = this.lastLy ? this.lastLy : 0; //Grab previously known first lyric index to start from

        //Walk through remaining lyrics until a good start point is found.
        while (lyi < this.lyrics.length && this.lyrics[lyi].startTime < bufferedTime) {
            lyi++;
        }
        this.lastLy = lyi; //Stash it's index for next time to be faster in search.

        //Determine x coordinate of start and end block.
        let firstX = -(startPixel % this.blockSize);
        let lastX = this.canvas.width + this.blockSize;

        //Holders for fadeouts and previous lyrics.
        let prevLy = this.lyrics[lyi - 1];
        let shading = 100;

        //Step through each block and decide what to draw.
        for (let i = firstX; i < lastX; i += this.blockSize) {
            let ly = this.lyrics[lyi];
            let lyPos = this.blockPos[blockCounter] ? this.blockPos[blockCounter] : this.lyricFloor;

            //Does this lyric exist and should it be displayed?
            if (ly && this.timeToPixel(ly.startTime) <= (i + startPixel)) {
                this.context.fillStyle = "black"; //Reset fade.
                shading = 100;
                this.context.fillText(ly.text, i, lyPos); //Draw the lyric.
                prevLy = ly; //Stash previous for possible fadeout.
                lyi++; //Move index.
            } else if (prevLy && prevLy.text != '”' && this.timeToPixel(prevLy.endTime) > (i + startPixel)) {
                //Fade between 100 & 220.
                this.context.fillStyle = `rgb(
                    ${Math.min(shading, 220)}
                    ${Math.min(shading, 220)}
                    ${Math.min(shading, 220)})`;
                this.context.fillText(prevLy.text, i, lyPos); //Draw the lyric
                shading += 40; //Increase fade.

            } else { //Show a block instead.
                this.context.fillStyle = "black"; //Reset fade.
                shading = 100;
                this.context.fillText('◼', i, lyPos); //Draw the square ▢
                // this.context.fillText('⬛', i, lyPos); //Draw the square ▢
                // this.context.fillText('⛾', i, lyPos); //Draw the square ▢
                //this.context.fillRect((i / step) * blockSize, blockBaseY, 39, 39); //Draw a square
            }

            blockCounter++;
        }

        this.context.fillStyle = "black"; //Reset fade.
    }

    /**
     * Turns timestamp into pixel based on step/block.
     */
    timeToPixel(time) {
        return (time / this.step) * this.blockSize;
    }

    /**
     * Turns timestamp into pixel based on step/block.
     */
    pixelToTime(pixel) {
        return pixel / this.blockSize * this.step;
    }

    showBg() {
        this.context.drawImage(this.bg, this.bgWidth, 0);
        this.context.drawImage(this.bg, this.bgWidth + this.canvas.width, 0);
        if (this.player.isPlaying || this.playFinish) this.bgWidth -= this.scrollSpeed; //Don't scroll if paused.
        if (Math.abs(this.bgWidth) >= this.canvas.width) {
            this.bgWidth = 0;
        }
    }

    showUser() {
        if (this.player.isPlaying) {
            let collision = this.playerBlock ? this.playerBlock : this.lyricFloor;
            this.user.doJump(this.timeStamp, collision);

            // When the user goes below the viewable canvas.
            if (this.user.yy > this.canvas.height) {
                this.toGameOver();
            }
        }

        this.user.draw(this.context)
    }

    /**
     * Should pause the game.
     */
    toPause() {
        if (this.player.isPlaying) {
            let pauseOverlay = document.getElementById("pauseOverlay");
            let buttonPause = document.getElementById("buttonPause");
            let buttonPlay = document.getElementById("buttonPlay");
            
            this.player.requestPause();
            // buttonPlayPause.src = "images/playbutton.png";
            clearInterval(this.user.walkingLoop);
            pauseOverlay.style.display = "flex";
            buttonPause.style.opacity = 0.5;
            buttonPlay.style.opacity = 1;
            const bars = document.querySelectorAll(".bar");
            for (let i = 0; i < bars.length; i++)
                bars.forEach(each => each.style.animation = null);
        }
    }

    /**
     * Should play the game.
     */
    toPlay() {
        if (!this.player.isPlaying) {
            let playOverlay = document.getElementById("playOverlay");
            let pauseOverlay = document.getElementById("pauseOverlay");
            let statsDiv = document.getElementById("statsDiv");
            let buttonPause = document.getElementById("buttonPause");
            let buttonPlay = document.getElementById("buttonPlay");

            this.player.requestPlay();
            this.user.walkingLoop = setInterval(() => {
                if(this.user.counter == 9) {this.user.counter = 1};
                this.user.puhplaya.src = 'images/rin/rin' + this.user.counter + '.png';
                this.user.counter++;
                pauseOverlay.style.display = "none";
                playOverlay.style.display = "none"
                statsDiv.style.display = "flex"
                buttonPlay.style.opacity = 0.5;
                buttonPause.style.opacity = 1;
            }, 70);
            const bars = document.querySelectorAll(".bar");
            for (let i = 0; i < bars.length; i++)
                bars.forEach(each => each.style.animationDuration = `${Math.random() * (0.25) + 0.25}s`);
        }
    }

    /**
     * Should pause the game.
     */
    toGameOver() {
        let gameOverOverlay = document.getElementById("gameOverOverlay");
        let buttonPause = document.getElementById("buttonPause");
        let buttonPlay = document.getElementById("buttonPlay");
        let buttonHero = document.getElementById("buttonHero");

        this.player.requestPause();
        clearInterval(this.user.walkingLoop);
        gameOverOverlay.style.display = "flex";

        buttonPause.style.opacity = 0.5;
        buttonPlay.style.opacity = 0.5;
        buttonPause.disabled = true;
        buttonPlay.disabled = true;

        const bars = document.querySelectorAll(".bar");
        for (let i = 0; i < bars.length; i++)
            bars.forEach(each => each.style.animation = null);
    }

}

/**
 * Simple object type to contain relevant lyric data.
 */
class Lyric {
    constructor(data) {
        this.text = data.text;
        this.startTime = data.startTime;
        this.endTime = data.endTime;
    }
}

/**
 * Get random integer.
 * @param {int} max 
 * @returns random integer between 0 inclusive and max exclusive.
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

//start!
let m = new Main();