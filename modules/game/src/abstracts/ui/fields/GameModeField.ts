import { Graphics } from "pixi.js";

import { AbstractField } from "../abstracts/AbstractField.ts";

export class GameModeField extends AbstractField {
  protected getThisName(): string {
    return `GameModeField`;
  }

  protected getFieldDescription(): string {
    return `Game mode: `;
  }

  protected createBackground() {
    this.bg = new Graphics();
    this.bg.name = `${this.name}_bg`;
    this.bg.lineStyle(2, 0xffffff, 0.8);
    this.bg.beginFill(0x000000, 0.6);
    this.bg.drawRoundedRect(0, 0, 200, 36, 8);
    this.bg.endFill();
  }
}
