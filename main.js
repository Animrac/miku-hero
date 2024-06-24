import { Player } from "textalive-app-api";

class Main {

    constructor() {
        //init canvas
        this.canvasInit();

        //init player
        this.playerInit();

        //currently set to click the canvas to start music
        document.getElementById("canvas").addEventListener("click", () => function (p) {
            if (p.isPlaying) {
                p.requestPause();
            } else {
                p.requestPlay();
            }
        }(this.player));

        //allow for dynamic width
        window.addEventListener("resize", () => this.resizeCanvas());

        //kickstart frame updates
        this.updateFrame();
    }

    /***
     * Initializes the viewable canvas properties.
     */
    canvasInit() {
        this.canvas = document.getElementById("canvas");
        this.canvas.style.background = "#ECFFDC"; // color is called nyanza :3

        //make the canvas take up the entire screen uwu
        this.canvas.width = window.innerWidth;
        this.canvas.height = 600;

        this.context = this.canvas.getContext("2d");
        this.context.font = "italic 16px Arial";
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
    }

    /***
     * Initializes the player object and listeners.
     */
    playerInit() {
        this.player = new Player({
            app: { token: "JY0mLoHiX3lPTJaS" }
        });

        this.player.addListener({
            onAppReady: (app) => this.loadSong(app),
            onVideoReady: (v) => this.loadLyrics(v),
            onTimeUpdate: (pos) => this.updateTime(pos)
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
        console.log(lyrics);
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
            this.showlyric();
        }

        //may i have another?
        window.requestAnimationFrame(() => this.updateFrame());
    }

    /**
     * Shows lyrics and squares on canvas.
     */
    showlyric() {
        if (!this.lyrics) return; //Don't do this if no lyrics have been loaded.
        let step = 100; //How many ms make up one vertical slice (aka, a square)
        let blockSize = 16; //Horizontal space taken up by each vertical slice.
        let lastBlockEnd = -1; //Comparison for right border of each given letter to prevent overlap.
        let lyricY = this.canvas.height - 50; //Vertical placement for lyric bar.
        let blockBaseY = lyricY - 50; //Vertical placement for floor of where squares will go.
        let canvasUsedPercent = 0.8; //How much of the canvas is used, from 0-1.

        //Self-notes to remember how the math works.
        //cw = 2000
        //20 blocks (2000/100)
        //last ly displayed: 2000 = ?/100 * 16 | 2000/16 * 100 | width/blockSize*step

        //Start scrolling when math says to.
        //Math: Current time - (utilized canvas width) / (block size) * (step)
        let startStamp = this.timeStamp - ((this.canvas.width * canvasUsedPercent) / blockSize * step);
        startStamp = Math.max(0, startStamp); //Default to 0 if we haven't used whole width yet

        //Clear previous draw
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);

        //Draw rects
        for (let i = 0; i < this.timeStamp; i += step) {
            this.context.fillRect((i / step) * blockSize, blockBaseY, 10, 10); //Draw a square
        }

        //Draw lyrics
        for (let i = 0; i < this.lyrics.length; i++) {
            let ly = this.lyrics[i]; //Get current lyric

            //Lyrics are drawn when their timestamp is before the present, and after the left screen border
            if (ly.startTime <= this.timeStamp && ly.startTime >= startStamp) {
                let adjustedTime = ly.startTime - startStamp; //Adjust the draw position based on scroll
                let xpos = (adjustedTime / step) * blockSize; //Adjust the draw position based on step/block size
                //let xpos = (ly.startTime / step) * blockSize;
                if (lastBlockEnd > xpos) xpos = lastBlockEnd + 1; //If char would overlap previous, bump it forward
                lastBlockEnd = xpos + blockSize; //Set the right border to check for future overlap

                this.context.fillText(ly.text, xpos, lyricY); //Draw the lyric
            }
        }
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