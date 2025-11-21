import {Container, Graphics, Text, TextStyleAlign} from "pixi.js";

export class AbstractField extends Container {
    protected _value!: number | string | boolean;
    protected bg!: Graphics;
    protected textField!: Text;

    public get value(): number | string | boolean {
        return this._value;
    }

    public set value(value: number | string | boolean) {
        this._value = value;
        this.textField.text = this.getFieldDescription() + this.value;
    }

    protected getThisName(): string {
        return `AbstractField`;
    }

    constructor(value: number | string | boolean) {
        super();

        this.name = this.getThisName();

        this.addElements();

        this.value = value;
    }

    protected getFieldDescription(): string {
        return `lipsum`;
    }

    protected addElements(): void {
        this.createTextField();
        this.createBackground();

        if (this.bg) {
            this.addChild(this.bg);

            if (this.getTextAlingment() === `center`) {
                this.textField.anchor.set(0.5);
            }

            this.textField.x = this.getTextAlingment() === `center` ? this.bg.width / 2 : 10;
            this.textField.y =
                this.getTextAlingment() === `center`
                    ? this.bg.height / 2
                    : this.bg.height / 2 - this.textField.height / 2;
        }
        this.addChild(this.textField);
    }

    protected createTextField(): void {
        this.textField = new Text(this.getFieldDescription() + this.value, {
            fontFamily: `Arial`,
            fontSize: 16,
            fill: 0xffffff,
            align: this.getTextAlingment()
        });
        this.textField.resolution = window.devicePixelRatio || 1;
        this.textField.name = `fieldDescription`;

        if (this.getTextAlingment() === `center`) {
            this.textField.anchor.set(0.5);
        }
    }

    protected createBackground(): void {
        this.bg = new Graphics();
        this.bg.name = `${this.name}_bg`;
        this.bg.beginFill(0x000000);
        this.bg.drawRoundedRect(0, 0, 200, 32, 8);
        this.bg.endFill();
    }

    protected getTextAlingment(): TextStyleAlign {
        return `center`;
    }
}
