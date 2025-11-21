import {BlurFilter, Container, Graphics, Text} from "pixi.js";
import {UILoader} from "../../../games/MagicWords/UILoader.ts";
import {pixiConfig} from "../../config";
import {AbstractModule} from "./AbstractModule";

export class IntroModule extends AbstractModule {
    private introText: Text;
    private textContainer: Container;
    private moduleContainer: Container;
    private shadowGraphics: Graphics;
    private loader: UILoader;
    private readonly MODULE_WIDTH = 800;
    private readonly MODULE_HEIGHT = 800;
    private readonly TEXT_CONTAINER_WIDTH = 400;
    private readonly TEXT_MAX_WIDTH = 380;

    constructor() {
        super(null);

        this.init();
        // Create main container for the module
        this.moduleContainer = new Container();

        // Create shadow
        this.shadowGraphics = new Graphics();
        this.updateShadow();
        this.addChild(this.shadowGraphics);

        // Create border
        // this.borderGraphics = new Graphics();
        // this.updateBorder();
        // this.moduleContainer.addChild(this.borderGraphics);

        // Create text container with background
        this.textContainer = new Container();

        // Create semi-transparent background
        const background = new Graphics();
        background.beginFill(0x000000, 0.6);
        background.drawRect(
            -this.TEXT_CONTAINER_WIDTH / 2,
            -100, // Initial height, will be updated
            this.TEXT_CONTAINER_WIDTH,
            200
        );
        background.endFill();
        this.textContainer.addChild(background);

        // Create intro text
        this.introText = new Text(`Initializing...`, {
            fontFamily: `Arial`,
            fontSize: 24,
            fill: 0xffffff,
            align: `center`,
            wordWrap: true,
            wordWrapWidth: this.TEXT_MAX_WIDTH
        });

        // Center the text
        this.introText.anchor.set(0.5);
        this.introText.x = 0; // Center relative to container
        this.introText.y = 0;
        this.textContainer.addChild(this.introText);

        // Create video sprite
        // const videoElement = assetsLoader.getVideo(VideoNames.INTRO_SCREEN);
        // const videoTexture = Texture.from(videoElement);
        // this.videoSprite = new Sprite(videoTexture);

        // Set video size to match module size
        // this.videoSprite.width = this.MODULE_WIDTH;
        // this.videoSprite.height = this.MODULE_HEIGHT;

        // Center everything to stage
        this.x = pixiConfig.width / 2;
        this.y = pixiConfig.height / 2;

        // Add video to module container
        // this.videoSprite.anchor.set(0.5);
        // this.moduleContainer.addChild(this.videoSprite);

        // Add text container on top and center it
        this.textContainer.x = 0; // Already centered within module container
        this.textContainer.y = 0;
        this.moduleContainer.addChild(this.textContainer);

        // Add module container to main container
        this.addChild(this.moduleContainer);

        this.loader = new UILoader();
        this.loader.scale.set(1);
        this.loader.start();

        this.addChild(this.loader);
        // Start video playback
        // videoElement.play();
    }

    public stopLoader(): void {
        this.loader.stop();
        this.removeChild(this.loader);
    }

    private updateShadow(): void {
        this.shadowGraphics.clear();
        this.shadowGraphics.beginFill(0x000000, 0.6);

        // Draw shadow slightly offset and larger than the module
        const shadowOffset = 2;
        const shadowBlur = 20;
        this.shadowGraphics.drawRect(
            -this.MODULE_WIDTH / 2 + shadowOffset,
            -this.MODULE_HEIGHT / 2 + shadowOffset,
            this.MODULE_WIDTH + shadowBlur,
            this.MODULE_HEIGHT + shadowBlur
        );
        this.shadowGraphics.endFill();

        //make the background blurry
        this.shadowGraphics.filters = [new BlurFilter(10)];
    }

    // private updateBorder(): void {
    //   this.borderGraphics.clear();
    //   this.borderGraphics.lineStyle(this.BORDER_WIDTH, 0xffffff, 1);
    //   this.borderGraphics.drawRect(
    //     -this.MODULE_WIDTH / 2,
    //     -this.MODULE_HEIGHT / 2,
    //     this.MODULE_WIDTH,
    //     this.MODULE_HEIGHT
    //   );
    // }

    protected init(): void {
        this.setupSignalsHandlers();
    }

    protected setupSignalsHandlers(): void {
        // signalsManager.on(SignalNames.UPDATE_INTRO_SCREEN_TEXT, (message: string) => {
        //   this.messageLog.push(message);
        //   this.updateText();
        // });
    }

    public resize(): void {
        if (this.parent) {
            // Center to stage
            this.x = this.parent.width / (2 * this.parent.scale.x);
            this.y = this.parent.height / (2 * this.parent.scale.y);

            // Update shadow and border
            this.updateShadow();
            // this.updateBorder();
        }
    }

    protected getModuleName(): string {
        return `IntroModule`;
    }

    protected getConsoleLogTextColor(): string {
        return `#FFD700`; // Gold color for intro module
    }
}
