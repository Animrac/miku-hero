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

        //kickstart frame updates
        this.updateFrame();
    }

    /***
     * Initializes the viewable canvas properties.
     */
    canvasInit() {
        let canvas = document.getElementById("canvas");
        canvas.style.background = "#ECFFDC"; // color is called nyanza :3

        var window_height = window.innerHeight;
        var window_width = window.innerWidth;

        //make the canvas take up the entire screen uwu
        canvas.width = window_width;
        canvas.height = 600;

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.context.font = "italic 16px Arial";
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

    showlyric() {
        if (!this.lyrics) return;

        for (let i = 0; i < this.lyrics.length; i++) {
            let ly = this.lyrics[i];
            if (ly.startTime <= this.timeStamp) {
                this.context.fillRect(i * 16, 120, 10, 10);
                this.context.fillText(ly.text, i * 16, 100);
            }
        }
    }
}

class Lyric {
    constructor (data) {
        this.text = data.text;
        this.startTime = data.startTime;
        this.endTime = data.endTime;
    }
}

//start!
// Main();
let m = new Main();