import gsap from "gsap";
import {Container, Graphics, Sprite} from "pixi.js";
import {assetsLoader} from "../../../AssetsLoader.ts";
import {GameName, SvgName} from "../../types/enums.ts";
import {IGame} from "../../types/interfaces.ts";
import {FastButton} from "../../ui/buttons/FastButton.ts";
import {PlayButton} from "../../ui/buttons/PlayButton.ts";
import {ReplayButton} from "../../ui/buttons/ReplayButton.ts";
import {isMobile} from "../../utils";

export abstract class AbstractGame extends Container implements IGame {
    protected background!: Graphics;
    protected overgroundUI!: Container;
    protected playBtn!: PlayButton;
    protected replayBtn!: ReplayButton;
    protected winningStarsContainer!: Container;
    protected winningStarsTimeline!: gsap.core.Timeline;
    protected fastButton!: FastButton;
    protected gameTimeline!: gsap.core.Timeline;
    protected enableWinningAnimation: boolean = true;

    // private initializationPromise: Promise<void>;

    constructor(public name: GameName) {
        super();

        console.log(
            `%c★ Presentation: Initializing ${this.constructor.name}`,
            this.getConsoleLogStyle()
        );
        this.setupSignalsHandlers();
        this.initialize();
    }

    protected async initialize(): Promise<void> {
        await this.init();
        this.postInit();
    }

    protected init(): Promise<void> {
        this.background = new Graphics();
        this.background.name = "GameBackground";
        this.background.beginFill(this.getBackgroundColor());
        this.background.drawRoundedRect(0, 0, 720, 720, 6);
        this.background.endFill();

        this.addChild(this.background);

        this.overgroundUI = new Container();
        this.overgroundUI.name = "OvergroundUI";

        const overgroundGraphics = new Graphics();
        overgroundGraphics.name = "UiOverground";
        overgroundGraphics.beginFill(0x000000, 0.8);
        overgroundGraphics.drawRect(0, 0, 720, 720);
        overgroundGraphics.endFill();
        this.overgroundUI.addChild(overgroundGraphics);

        this.playBtn = new PlayButton();
        this.playBtn.x = 320;
        this.playBtn.y = 320;

        this.playBtn.on(isMobile() ? "pointerdown" : "click", () => {
            this.removeChild(this.overgroundUI);

            this.onPlayButtonClicked();
        });

        this.overgroundUI.addChild(this.playBtn);

        this.replayBtn = new ReplayButton();
        this.replayBtn.x = this.playBtn.x;
        this.replayBtn.y = this.playBtn.y;

        this.replayBtn.on(isMobile() ? "pointerdown" : "click", () => {
            this.reset();

            this.removeChild(this.overgroundUI);

            this.onPlayButtonClicked();
        });

        this.winningStarsContainer = new Container();
        this.winningStarsContainer.y = 84;

        for (let i = 0; i < 3; i++) {
            const star = new Sprite();

            const texture = assetsLoader.getSvg(SvgName.STAR_ICON);
            star.texture = texture;
            star.scale.set(0.1);
            star.anchor.set(0.5);
            star.x = i * 100;

            this.winningStarsContainer.addChild(star);
        }

        this.winningStarsContainer.x =
            this.overgroundUI.width / 2 - this.winningStarsContainer.width / 2 + 40;

        return Promise.resolve();
    }

    protected onPlayButtonClicked(): void {}

    protected postInit(): void {
        console.log(
            `%c★ Presentation: Post-init ${this.constructor.name}`,
            this.getConsoleLogStyle()
        );
    }

    public async start(): Promise<void> {
        console.log(
            `%c★ Presentation: Starting ${this.constructor.name}`,
            this.getConsoleLogStyle()
        );
        await this.onStart();
    }

    public async finish(): Promise<void> {
        console.log(
            `%c★ Presentation: Finishing ${this.constructor.name}`,
            this.getConsoleLogStyle()
        );
        await this.onFinish();
        // await this.stateMachine.next();
    }

    protected onStart(): Promise<void> {
        return Promise.resolve().then(() => {
            this.reset();
        });
    }

    protected onFinish(): Promise<void> {
        this.overgroundUI.removeChild(this.playBtn);

        if (this.enableWinningAnimation) {
            this.winningStarsTimeline = gsap.timeline({
                smoothChildTiming: true,
                autoRemoveChildren: true,
                delay: 0.2,
                onComplete: () => {
                    this.overgroundUI.addChild(this.replayBtn);
                }
            });

            this.overgroundUI.addChild(this.winningStarsContainer);

            this.winningStarsContainer.children.forEach((child) => {
                child.alpha = 0;
                if (child instanceof Sprite) {
                    child.scale.set(0.14);

                    const starTween = gsap.to(child, {
                        alpha: 1,
                        pixi: { scale: 0.1 },
                        duration: 0.3
                    });

                    this.winningStarsTimeline.add(starTween);
                }
            });
        } else {
            this.overgroundUI.addChild(this.replayBtn);
        }

        this.addChild(this.overgroundUI);

        return Promise.resolve();
    }

    protected getConsoleLogTextColor(): string {
        return `white`;
    }

    protected getConsoleLogStyle(): string {
        return `color: ${this.getConsoleLogTextColor()}; background-color: black; font-weight: bold;`;
    }

    protected setupSignalsHandlers(): void {}

    protected getBackgroundColor(): number {
        return 0x000000;
    }

    protected resetTimeline(): void {
        if (this.gameTimeline) {
            this.gameTimeline.kill();
        }

        this.gameTimeline = gsap.timeline({
            autoRemoveChildren: true,
            smoothChildTiming: true,
            onComplete: () => {
                this.onFinish();
            }
        });
    }

    reset(): Promise<void> {
        return Promise.resolve();
    }
}
