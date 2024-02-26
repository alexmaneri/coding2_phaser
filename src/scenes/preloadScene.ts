import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        this.load.image("coin1", "assets/Coin1.png");
        this.load.image("coin2", "assets/Coin2.png");
        this.load.image("coin3", "assets/Coin3.png");
        this.load.image("coin4", "assets/Coin4.png");
        this.load.image("coin5", "assets/Coin5.png");
        this.load.image("coin6", "assets/Coin6.png");

        this.load.image("ground", "assets/platform.png");
        this.load.image("bomb", "assets/bomb.png");
        this.load.image("sky", "assets/sky.png");
        this.load.image("star", "assets/star.png");
        this.load.spritesheet("dude", "assets/dude.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load;
    }

    create() {
        this.scene.start("MainScene");
    }
}
