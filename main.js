import { Player } from "textalive-app-api";


class Main {
    
    constructor() {
        //init canvas
        this.canvasInit();

        //init player
        this.playerInit();

        //currently set to click the canvas to start music
        document.getElementById("canvas").addEventListener("click", () => function(p){ 
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
        // canvas.width = window_width;
        // canvas.height = window_height;
    }


    /***
     * Initializes the player object and listeners.
     */
    playerInit() {
        this.player = new Player({
            app: { token: "JY0mLoHiX3lPTJaS" },
            mediaElement: document.querySelector("#media")
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
                lyrics.push(ly);
                ly = ly.next;
            }
        }
        console.log(lyrics);
    }

    /***
     * Do updates based on time (in ms).
     */
    updateTime(pos) {
        //Do updates based on time 
        this.pos = pos;
        this.lastUpdateTime = Date.now();
    }

    /***
     * Do updates based on frames (in how-good-your-monitor-is).
     */
    updateFrame() {
        //do updates based on frames

        //may i have another?
        window.requestAnimationFrame(() => this.updateFrame());
    }
}



//start!
// Main();
let m = new Main();