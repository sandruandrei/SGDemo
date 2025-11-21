import * as PIXI from "pixi.js";
import {Container, Graphics} from "pixi.js";

const createGradientTexture = (
    colorTop: string,
    colorBottom: string,
    width = 100,
    height = 200
): PIXI.Texture => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);

    gradient.addColorStop(0, colorTop);
    gradient.addColorStop(1, colorBottom);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return PIXI.Texture.from(canvas);
};

const texture = createGradientTexture("#9654bd", "#783d9a");
export const cardWidth = 100;
export const cardHeight = 160;

export class Card extends Container {
    private background!: Graphics;

    constructor() {
        super();

        this.initialize();
    }

    private initialize(): void {
        this.background = new Graphics();
        this.background.name = "CardBackground";
        this.background.lineStyle(1, 0x431c5c, 0.8);
        this.background.beginTextureFill({ texture: texture });
        this.background.drawRoundedRect(0, 0, cardWidth, cardHeight, 10);
        this.background.endFill();

        this.background.lineStyle(3, 0xffffff, 0.8);
        this.background.beginFill(0xffffff, 0);
        this.background.drawRoundedRect(10, 10, cardWidth - 20, cardHeight - 20, 9);

        this.background.lineStyle(2, 0xbe8ccb, 0.9);
        this.background.beginFill(0xffffff, 0);
        this.background.drawRoundedRect(15, 15, cardWidth - 30, cardHeight - 30, 6);

        this.background.lineStyle(2, 0xffffff, 0.8);
        this.background.beginFill(0xffffff, 0);
        this.background.drawCircle(cardWidth / 2, cardHeight / 2, cardWidth / 4);
        this.background.endFill();

        this.background.lineStyle();
        this.background.beginFill(0xbe8ccb, 0.8);
        this.background.drawCircle(cardWidth / 2, cardHeight / 2, cardWidth / 4 - 5);
        this.background.endFill();

        this.background.pivot.x = this.background.width / 2;
        this.background.pivot.y = this.background.height / 2;

        this.addChild(this.background);
    }
}
