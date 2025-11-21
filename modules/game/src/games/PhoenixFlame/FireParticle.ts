import {gsap} from "gsap";
import {Graphics, Sprite} from "pixi.js";

export class FireParticle extends Sprite {
    public defaultX = 0;
    public defaultY = 0;
    public defaultScale = 1;
    public defaultRotation = 0;

    constructor() {
        super();

        this.init();
    }

    private init() {
        const particleGraphics = new Graphics();
        particleGraphics.name = "FireParticle";
        particleGraphics.beginFill(0xdfce16);
        particleGraphics.drawCircle(0, -30, 30);
        particleGraphics.endFill();
        particleGraphics.cacheAsBitmap = true;

        this.addChild(particleGraphics);
    }

    public reset() {
        gsap.killTweensOf(this);

        // @ts-ignore
        this.filters = null;

        this.x = this.defaultX;
        this.y = this.defaultY;
        this.scale.set(this.defaultScale);
        this.rotation = this.defaultRotation;
    }
}
