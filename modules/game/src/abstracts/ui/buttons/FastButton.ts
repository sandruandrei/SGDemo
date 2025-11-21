import {Texture} from "pixi.js";
import {assetsLoader} from "../../../AssetsLoader.ts";
import {SvgName} from "../../types/enums.ts";
import {PlayButton} from "./PlayButton.ts";

export class FastButton extends PlayButton {
    protected override getName(): string {
        return `FastButton`;
    }

    public changeIconTexture(texture: Texture): void {
        this.onIcon.texture = texture;
        this.onIcon.width = this.buttonSize;
        this.onIcon.height = this.buttonSize;

        this.offIcon.texture = texture;
        this.offIcon.width = this.buttonSize;
        this.offIcon.height = this.buttonSize;

        this.getChildAt(0).visible = false;
    }

    protected createOnTexture(): void {
        const texture = assetsLoader.getSvg(SvgName.FAST_ICON);

        this.onIcon.texture = texture;
        this.onIcon.width = this.buttonSize;
        this.onIcon.height = this.buttonSize;
    }

    protected createOffTexture(): void {}
}
