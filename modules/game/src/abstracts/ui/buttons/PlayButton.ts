import {assetsLoader} from "../../../AssetsLoader.ts";
import {SvgName} from "../../types/enums.ts";
import {AbstractButton} from "../abstracts/AbstractButton.ts";

export class PlayButton extends AbstractButton {
    protected override getName(): string {
        return `PlayButton`;
    }

    protected setupInteractivity(): void {
        this.eventMode = `static`;
        this.cursor = `pointer`;

        this.on(`pointerdown`, () => {
            this.onIcon.alpha = 0.6;
        });

        this.on(`pointerenter`, () => {
            this.onIcon.alpha = 0.8;
        });

        this.on(`pointerleave`, () => {
            this.onIcon.alpha = 1;
        });

        this.on(`pointerupoutside`, () => {
            this.onIcon.alpha = 1;
        });
    }

    protected createOnTexture(): void {
        const texture = assetsLoader.getSvg(SvgName.PLAY_ICON);

        this.onIcon.texture = texture;
        this.onIcon.width = this.buttonSize;
        this.onIcon.height = this.buttonSize;
    }

    protected createOffTexture(): void {}
}
