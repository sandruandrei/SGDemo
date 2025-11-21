import {Container, Graphics} from "pixi.js";
import {gameConfig} from "../config.ts";
import {SoundButton} from "./buttons/SoundButton.ts";
import {MenuDropdown} from "./dropdowns/MenuDropdown.ts";

export abstract class Menu extends Container {
    protected menuBg!: Graphics;
    protected soundBtn!: SoundButton;
    protected menuDropdown!: MenuDropdown;

    constructor() {
        super();
        this.name = `UiMenu`;
        this.createButtons();
        this.createBackground();
        this.createFields();
    }

    private createFields(): void {
        this.menuDropdown = new MenuDropdown();
        this.addChild(this.menuDropdown);
    }

    private createBackground(): void {
        this.menuBg = new Graphics();
        this.menuBg.name = `menuBg`;
        this.menuBg.beginFill(0x06010c, 0.8);
        this.menuBg.lineStyle(2, 0x152068, 0.7);
        this.menuBg.drawRoundedRect(-335 - 10, -10, 670 + 20, 94, 10);
        this.menuBg.endFill();

        this.menuBg.beginFill(0x55076c, 0.8);
        this.menuBg.lineStyle(4, 0xe24e8a, 0.8);
        this.menuBg.drawRoundedRect(-335, 0, 670, 74, 10);
        this.menuBg.endFill();

        this.addChildAt(this.menuBg, 0);

        this.menuBg.addChild(this.soundBtn);
    }

    private createButtons(): void {
        this.soundBtn = new SoundButton();
        this.soundBtn.scale.set(0.8);
        this.soundBtn.x = 275;
        this.soundBtn.y = 16;
    }

    public resize({
        scaleFactor = 1,
        windowHeight = gameConfig.display.height
    }: {
        scaleFactor: number;
        windowWidth: number;
        windowHeight: number;
    }): void {
        const stageHeight = windowHeight / scaleFactor;

        this.menuBg.x = 640;
        this.menuBg.y = -stageHeight / 2 + 418;

        this.menuDropdown.x = this.menuBg.x - this.menuDropdown.width / 2;
        this.menuDropdown.y = this.menuBg.y + 10;
    }
}
