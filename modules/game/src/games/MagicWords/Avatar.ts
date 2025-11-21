import {Container, Graphics, Sprite, Texture} from "pixi.js";

export class Avatar extends Container {
    constructor(texture: Texture) {
        super();

        const background = new Graphics();
        background.lineStyle(1, 0xcccccc);
        background.beginFill(0xffffff);
        background.drawCircle(40, 40, 40);
        background.endFill();

        this.addChild(background);

        const avatar = new Sprite(texture);
        avatar.anchor.set(0.5);
        avatar.height = 90;
        avatar.scale.x = avatar.scale.y;
        avatar.x = 40;
        avatar.y = 35;
        this.addChild(avatar);

        const avatarMask = new Graphics();
        avatarMask.beginFill(0xffffff);
        avatarMask.drawCircle(40, 40, 40);
        avatarMask.endFill();
        this.addChild(avatarMask);

        avatar.mask = avatarMask;
    }
}
