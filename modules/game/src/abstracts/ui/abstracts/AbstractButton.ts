import {Container, Graphics, Sprite} from "pixi.js";

export class AbstractButton extends Container {
    protected _isOn: boolean = false;
    protected onIcon!: Sprite;
    protected offIcon!: Sprite;

    protected get buttonSize(): number {
        return 80;
    }

    protected get isOn(): boolean {
        return this._isOn;
    }

    protected set isOn(value: boolean) {
        this._isOn = value;
    }

    constructor() {
        super();
        this.name = this.getName();
        this.setup();
    }

    protected getName(): string {
        return `AbstractButton`;
    }

    protected setup(): void {
        const background = new Graphics();
        background.name = `${this.name}_background`;
        this.drawBackground(background);
        this.addChild(background);

        this.createOnIcon();
        this.createOffIcon();

        this.setupInteractivity();
    }

    protected setupInteractivity(): void {
        this.eventMode = `static`;
        this.cursor = `pointer`;

        this.on(`pointerdown`, () => {
            this.isOn = !this.isOn;

            if (this.onIcon && this.offIcon) {
                this.onIcon.visible = this.isOn;
                this.offIcon.visible = !this.isOn;
            }
        });

        this.on(`pointerup`, () => {});

        this.on(`pointerupoutside`, () => {});
    }

    protected drawBackground(graphics: Graphics): void {
        graphics.clear();
        graphics.lineStyle(3, 0xffffff);
        graphics.beginFill(0x000000);
        graphics.drawCircle(this.buttonSize / 2, this.buttonSize / 2, this.buttonSize / 2);
        graphics.endFill();
    }

    protected createOnIcon(): void {
        this.onIcon = new Sprite();
        this.onIcon.name = `${this.name}_on`;

        this.createOnTexture();

        this.addChild(this.onIcon);
    }

    protected createOffIcon(): void {
        this.offIcon = new Sprite();
        this.offIcon.name = `${this.name}_off`;

        this.createOffTexture();

        this.offIcon.visible = false;

        this.addChild(this.offIcon);
    }

    protected createOnTexture(): void {}

    protected createOffTexture(): void {}

    public show(): void {
        this.visible = true;
    }

    public hide(): void {
        this.visible = false;
    }

    public reset(): void {
        this.onIcon.alpha = 1;
        this.offIcon.alpha = 1;
        this.alpha = 1;
    }
}
