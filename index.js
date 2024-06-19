import { Player } from "textalive-app-api";

class Main {
    constructor () {

        //initialize player
        var player = new Player({
            // トークンは https://developer.textalive.jp/profile で取得したものを使う
            app: { token: "test" },
            mediaElement: document.querySelector("#media")
        });
        
        player.addListener({
            onAppReady: (app) => this._onAppReady(app),
            onVideoReady: (v) => this._onVideoReady(v),
            onTimeUpdate: (pos) => this._onTimeUpdate(pos)
        });
        this._player = player;
    }
}