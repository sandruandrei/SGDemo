import {gsap} from "gsap";
import {Sprite} from "pixi.js";
import {assetsLoader} from "../../AssetsLoader.ts";
import {ImageName} from "../../abstracts/types/enums.ts";

export class UILoader extends Sprite {
    private rotationTween!: gsap.core.Tween;

    constructor() {
        super(assetsLoader.getTexture(ImageName.LOADER));
        this.scale.set(0.5);
        this.anchor.set(0.5, 1);
    }

    public start(): void {
        this.rotationTween = gsap.to(this, {
            rotation: Math.PI * 2,
            duration: 1,
            repeat: -1,
            ease: "none"
        });
    }

    public stop(): void {
        this.rotationTween.kill();

        this.rotation = 0;
    }
}
