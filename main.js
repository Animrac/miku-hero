import { Player } from "textalive-app-api";

class Main {

    constructor() {
        this.step = 100; //How many ms make up one vertical slice (aka, a square)
        this.blockSize = 40; //Horizontal space taken up by each vertical slice.

        //init canvas
        this.canvasInit();

        //init player
        this.playerInit();

        //init volume
        this.volumeInit();

        //init buttons
        this.buttonInit();

        //allow for dynamic width
        window.addEventListener("resize", () => this.resizeCanvas());

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
        
        // this.canvas.style.background = "#ECFFDC"; // color is called nyanza :3
        
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
            mediaElement: document.getElementById("media")
        });

        this.player.addListener({
            onAppReady: (app) => this.loadSong(app),
            onVideoReady: (v) => {
                this.loadLyrics(v);
                document.getElementById("artist").textContent = this.player.data.song.artist.name;
                document.getElementById("song").textContent = this.player.data.song.name;
            },
            onTimeUpdate: (pos) => this.updateTime(pos),
            onTimerReady: () => {
                document.getElementById("loadingOverlay").style.display = "none"
            }
        });
    }

    /***
     * Initializes the volume slider.
     */
    volumeInit() {
        this.volumeSlider = document.getElementById("volumeSlider").addEventListener("input", (event) => {
            const volume = parseFloat(event.target.value);
            this.player.volume = volume;
          });
          //initial volume
          this.player.volume = 3;
    }
    
    /***
     * Initializes the play button.
     */
    buttonInit() {
        // document.getElementById("buttonPlay").addEventListener("click", () => function (p) {
        //     p.requestPlay();
        //     document.getElementById("playOverlay").style.display = "none"
        // }(this.player));

        document.getElementById("playOverlay").addEventListener("click", () => {
            this.player.requestPlay();
            document.getElementById("playOverlay").style.display = "none";
        });        

        document.getElementById("canvas").addEventListener("click", () => {
            if (this.player.isPlaying) {
                this.player.requestPause();
            } else {
                this.player.requestPlay();
            }
        });
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
    }

    /***
     * Do updates based on time (in ms).
     */
    updateTime(timeStamp) {
        this.timeStamp = timeStamp;
    }

    /***
     * Do updates based on frames (in how-good-your-monitor-is).
     */
    updateFrame() {
        //show lyrics
        if (this.player.isPlaying && this.timeStamp > 0) {
            this.showLyric();
        }

        //may i have another?
        window.requestAnimationFrame(() => this.updateFrame());
    }

    /**
     * Draws on canvas.
     */
    showLyric() {
        if (!this.lyrics) return; //Don't do stuff if no lyrics have been loaded.

        let lyricY = this.canvas.height - 120; //Vertical placement for lyric bar.
        let blockBaseY = lyricY //lyricY - 80; //Vertical placement for floor of where squares will go.
        let delay = 200; //amount of time in ms to delay from impact
        let startPixel = this.timeToPixel(this.timeStamp - delay); //Convert timestamp to pixel for cleaner math.
        
        //Determine first lyric that will be shown
        let bufferedTime = this.timeStamp - delay - this.step; //Be generous in what lyric we grab first.
        let lyi = this.lastLy ? this.lastLy : 0; //Grab previously known first lyric index to start from
        
        //Walk through remaining lyrics until a good start point is found.
        while (lyi < this.lyrics.length && this.lyrics[lyi].startTime < bufferedTime) {
            lyi++;
        }
        this.lastLy = lyi; //Stash it's index for next time to be faster in search.
        
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height); //Clear screen.
        
        //Determine x coordinate of start and end block.
        let firstX = -(startPixel % this.blockSize);
        let lastX = this.canvas.width + this.blockSize;

        //Holders for fadeouts and previous lyrics.
        let prevLy = this.lyrics[lyi - 1];
        let shading = 100;

        //Step through each block and decide what to draw.
        for (let i = firstX; i < lastX; i += this.blockSize) {
            let ly = this.lyrics[lyi];

            //Does this lyric exist and should it be displayed?
            if (ly && this.timeToPixel(ly.startTime) <= (i + startPixel)) {
                this.context.fillStyle = "black"; //Reset fade.
                shading = 100;
                this.context.fillText(ly.text, i, lyricY); //Draw the lyric.
                prevLy = ly; //Stash previous for possible fadeout.
                lyi++; //Move index.
            } else if (prevLy && prevLy.text != '”' && this.timeToPixel(prevLy.endTime) > (i + startPixel + this.blockSize)) {
                //Fade between 100 & 220.
                this.context.fillStyle = `rgb(
                    ${Math.min(shading, 220)}
                    ${Math.min(shading, 220)}
                    ${Math.min(shading, 220)})`;
                this.context.fillText(prevLy.text, i, lyricY); //Draw the lyric
                shading += 40; //Increase fade.

            } else { //Show a block instead.
                this.context.fillStyle = "black"; //Reset fade.
                shading = 100;
                this.context.fillText('▢', i, lyricY); //Draw the square
                //this.context.fillRect((i / step) * blockSize, blockBaseY, 39, 39); //Draw a square
            }
        }
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
}

/**
 * Simple object type to contain relevant lyric data.
 */
class Lyric {
    constructor (data) {
        this.text = data.text;
        this.startTime = data.startTime;
        this.endTime = data.endTime;
    }
}

//start!
let m = new Main();