import {assetsLoader} from "../../../AssetsLoader.ts";
import {SvgName} from "../../types/enums.ts";
import {PlayButton} from "./PlayButton.ts";

export class ReplayButton extends PlayButton {
    protected override getName(): string {
        return `ReplayButton`;
    }

    protected createOnTexture(): void {
        const texture = assetsLoader.getSvg(SvgName.REPLAY_ICON);

        this.onIcon.texture = texture;
        this.onIcon.width = this.buttonSize;
        this.onIcon.height = this.buttonSize;
    }

    protected createOffTexture(): void {}
}
