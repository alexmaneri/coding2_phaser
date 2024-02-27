import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private coins?: Phaser.Physics.Arcade.Group;
    private score = 0;
    private round = 1;
    private playerShield = false;
    private gameShield = false;
    private roundText?: Phaser.GameObjects.Text;
    private scoreText?: Phaser.GameObjects.Text;
    private bombs?: Phaser.Physics.Arcade.Group;
    private shields?: Phaser.Physics.Arcade.Group;
    private gameOver = false;

    constructor() {
        super({ key: "MainScene" });
    }

    create() {
        this.add.image(400, 300, "sky");
        this.platforms = this.physics.add.staticGroup();
        const ground = this.platforms.create(
            400,
            568,
            "ground"
        ) as Phaser.Physics.Arcade.Sprite;
        ground.setScale(2).refreshBody();

        this.platforms.create(600, 400, "ground");
        this.platforms.create(50, 250, "ground");
        this.platforms.create(750, 220, "ground");

        this.player = this.physics.add.sprite(100, 450, "dude");
        //this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "turn",
            frames: [{ key: "dude", frame: 4 }],
            frameRate: 20,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {
                start: 5,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.physics.add.collider(this.player, this.platforms);
        this.cursors = this.input.keyboard?.createCursorKeys();

        this.coins = this.physics.add.group({
            key: "coins",
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 },
        });
        this.coins.children.iterate((c) => {
            const child = c as Phaser.Physics.Arcade.Image;
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            return true;
        });

        this.anims.create({
            key: "spin",
            frames: [
                { key: "coin1" },
                { key: "coin2" },
                { key: "coin3" },
                { key: "coin4" },
                { key: "coin5" },
                { key: "coin6" },
                { key: "coin5" },
                { key: "coin4" },
                { key: "coin3" },
                { key: "coin2" },
            ],
            frameRate: 10,
            repeat: -1,
        });

        // Play the animation
        this.coins.playAnimation("spin");

        this.physics.add.collider(this.coins, this.platforms);
        this.physics.add.overlap(
            this.player,
            this.coins,
            this.handleCollectCoin,
            undefined,
            this
        );

        this.scoreText = this.add.text(16, 16, "score: 0", {
            fontSize: "32px",
            color: "#000",
        });
        this.roundText = this.add.text(650, 16, "round: 0", {
            fontSize: "22px",
            color: "#000",
        });

        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(
            this.player,
            this.bombs,
            this.handleHitBomb,
            undefined,
            this
        );

        this.shields = this.physics.add.group();
        this.physics.add.collider(this.shields, this.platforms);
        this.physics.add.collider(this.shields, this.bombs);
        this.physics.add.collider(
            this.player,
            this.shields,
            this.handleCollectShield,
            undefined,
            this
        );
    }

    private handleCollectShield(
        player:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile,
        s: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
    ) {
        const coin = s as Phaser.Physics.Arcade.Image;
        coin.disableBody(true, true);
        this.playerShield = true;
        this.player?.setTint(0xadd8e6);
        this.gameShield = false;
    }

    private handleHitBomb() {
        if (!this.playerShield) {
            this.physics.pause();
            this.player?.setTint(0xff0000);
            this.player?.anims.play("turn");
            this.gameOver = true;
        } else {
            this.player?.clearTint();
            this.playerShield = false;
        }
    }

    private handleCollectCoin(
        player:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile,
        c: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
    ) {
        const coin = c as Phaser.Physics.Arcade.Image;
        coin.disableBody(true, true);

        this.score += 10;
        this.scoreText?.setText("Score: " + this.score);
        this.roundText?.setText("Round: " + this.round);

        if (this.coins?.countActive(true) === 0) {
            this.round += 1;
            this.coins.children.iterate((c) => {
                const child = c as Phaser.Physics.Arcade.Image;
                child.enableBody(true, child.x, 0, true, true);
                return true;
            });

            if (this.player) {
                const x =
                    this.player.x < 400
                        ? Phaser.Math.Between(400, 800)
                        : Phaser.Math.Between(0, 400);
                const bomb: Phaser.Physics.Arcade.Image = this.bombs?.create(
                    x,
                    16,
                    "bomb"
                );
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
            if (
                this.player &&
                this.round % 2 === 0 &&
                !this.gameShield &&
                !this.playerShield
            ) {
                this.gameShield = true;
                const m =
                    this.player.x < 400
                        ? Phaser.Math.Between(400, 800)
                        : Phaser.Math.Between(0, 400);
                const s: Phaser.Physics.Arcade.Image = this.shields?.create(
                    m,
                    16,
                    "shield"
                );
                s.setScale(0.025);
                s.setBounce(1);
                s.setCollideWorldBounds(true);
                s.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
        }
    }
    update() {
        if (!this.cursors) {
            return;
        }
        if (this.cursors.left.isDown) {
            this.player?.setVelocityX(-160);
            this.player?.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
            this.player?.setVelocityX(160);
            this.player?.anims.play("right", true);
        } else {
            this.player?.setVelocityX(0);
            this.player?.anims.play("turn");
        }
        if (this.cursors.up.isDown && this.player?.body?.touching.down) {
            this.player.setVelocityY(-330);
        } else if (this.cursors.down.isDown) {
            this.player?.setVelocityY(330);
        }
    }
}
