import {BitmapText} from "pixi.js";
import {BitmapTextProps} from "../types/interfaces.ts";

export class AbstractBitmapText extends BitmapText {
    constructor(bitmapTextProps: BitmapTextProps) {
        super(bitmapTextProps.text, {
            ...bitmapTextProps.style,
            fontSize: +bitmapTextProps.style.fontSize * 2
        });

        this.scale.set(0.5);

        this.pivot.x = this.textWidth / 2;

        this.cacheAsBitmap = true;
    }

    public updateValue(value: string, cacheAsBitmap: boolean = false): void {
        this.cacheAsBitmap = false;

        this.text = value;

        this.pivot.x = this.textWidth / 2;

        if (cacheAsBitmap) {
            this.cacheAsBitmap = true;
        }
    }

    public reset() {
        this.cacheAsBitmap = false;

        // @ts-ignore
        this.filters = null;

        this.scale.set(0.5);
        this.alpha = 1;
        this.updateText();
        this.cacheAsBitmap = true;
    }
}
