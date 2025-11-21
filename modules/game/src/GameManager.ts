import * as PIXI from "pixi.js";
import {Application, BaseTexture, Program} from "pixi.js";
import {Stats} from "pixi-stats";
import {assetsLoader} from "./AssetsLoader.ts";
import {
    assetsConfig,
    backgroundConfig,
    gamesConfig,
    gameStatesConfig,
    pixiConfig,
    soundConfig
} from "./abstracts/config.ts";
import {signalsManager} from "./abstracts/signals/SignalsManager.ts";
import {AbstractGame} from "./abstracts/stateManagement/games/AbstractGame.ts";
import {BackgroundModule} from "./abstracts/stateManagement/modules/BackgroundModule.ts";
import {ConnectionModule} from "./abstracts/stateManagement/modules/ConnectionModule.ts";
import {GamesModule} from "./abstracts/stateManagement/modules/GamesModule.ts";
import {IntroModule} from "./abstracts/stateManagement/modules/IntroModule.ts";
import {SoundModule} from "./abstracts/stateManagement/modules/SoundModule.ts";
import {UiModule} from "./abstracts/stateManagement/modules/UiModule.ts";
import {GameName, GameState, SignalNames} from "./abstracts/types/enums.ts";
import {IGameManager, IGameManagerModules, IStateMachine} from "./abstracts/types/interfaces.ts";
import {LoadingError} from "./abstracts/types/types.ts";
import {AcesOfShadows} from "./games/AcesOfShadows/AcesOfShadows.ts";
import {MagicWords} from "./games/MagicWords/MagicWords.ts";
import {PhoenixFlame} from "./games/PhoenixFlame/PhoenixFlame.ts";
import {StateMachine} from "./StateMachine.ts";

export class GameManager implements IGameManager {
    protected stateMachine!: IStateMachine;
    protected modules!: IGameManagerModules;
    protected app!: Application;
    protected userId!: string;
    protected games!: AbstractGame[];

    private static isInitialized = false;

    async initialize(): Promise<void> {
        assetsLoader.setManifest(this.getAssetsConfig());

        console.log(`%cGameManager: Initializing`, this.getConsoleLogStyle());

        this.setupSignalsHandlers();

        await this.initializeStateMachine();
    }

    protected setupSignalsHandlers(): void {
        // console.log(
        //   "%cGameManager: Setting up signal handlers",
        //   this.getConsoleLogStyle()
        // );

        signalsManager.on(SignalNames.LOADING_COMPLETE, async () => {
            console.log(`%cGameManager: Assets loading complete`, this.getConsoleLogStyle());
            await this.initializeModules();

            await this.createPixiApp();

            await this.stateMachine.next(GameState.LOADING_COMPLETE);
        });

        signalsManager.on(SignalNames.LOADING_FAILED, async (error: LoadingError) => {
            console.error(`%cGameManager: Assets loading failed`, this.getConsoleLogStyle(), error);
        });

        signalsManager.on(SignalNames.START_AUTH, async () => {
            console.log(`%cGameManager: Starting authentication`, this.getConsoleLogStyle());

            signalsManager.emit(SignalNames.SET_USER_ID, this.userId);
        });

        signalsManager.on(SignalNames.AUTH_COMPLETE, async () => {
            console.log(`%cGameManager: Authentication complete`, this.getConsoleLogStyle());

            this.app.stage.addChild(this.modules.games);
            this.app.stage.addChild(this.modules.ui);

            this.app.stage.removeChild(this.modules.intro);
            this.modules.intro.stopLoader();

            await this.stateMachine.next(GameState.AUTH_COMPLETE);
        });

        signalsManager.on(
            SignalNames.CHANGE_GAME,
            async (gameName: GameName = GameName.ACE_OF_SHADOWS) => {
                await this.handleGameChange(gameName);
            }
        );

        signalsManager.on(SignalNames.GAME_CHANGED, async (gameMode: GameState) => {
            console.log(`%cGameManager: Game mode changed`, this.getConsoleLogStyle(), gameMode);
        });

        signalsManager.on(SignalNames.CONNECTED_TO_SERVER, async () => {
            await this.stateMachine.next(GameState.AUTH_STARTED);
        });
    }

    protected getGameConfig() {
        return pixiConfig;
    }

    protected async handleGameChange(gameName: GameName) {
        await this.stateMachine.next(GameState.CHANGE_GAME);

        let newGame = this.games.find((game) => game.name === gameName);

        if (!newGame) {
            switch (gameName) {
                case GameName.MAGIC_WORDS:
                    newGame = new MagicWords();
                    break;

                case GameName.PHOENIX_FLAME:
                    newGame = new PhoenixFlame();
                    break;

                case GameName.ACE_OF_SHADOWS:
                default:
                    newGame = new AcesOfShadows();
                    break;
            }

            if (!this.games.includes(newGame)) {
                this.games.push(newGame as AbstractGame);
            }
        }

        this.modules.games.changeGame(newGame);
        this.modules.background.onGameChange(gameName);

        await this.stateMachine.next(GameState.PLAY_GAME);
    }

    protected async createPixiApp(): Promise<void> {
        const loadingDiv = document.getElementById("loading");
        if (loadingDiv) {
            loadingDiv.remove();
        }

        console.log(`%cGameManager: Creating Pixi app`, this.getConsoleLogStyle());

        Program.defaultFragmentPrecision = PIXI.PRECISION.HIGH;

        BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST; // might help a bit
        PIXI.settings.ROUND_PIXELS = true; // might help a bit
        PIXI.settings.RESOLUTION = 2;

        const config = this.getGameConfig();
        const canvasParent = document.getElementById(`app`) as HTMLDivElement;
        canvasParent.style.position = "absolute";
        canvasParent.style.height = "100%";
        canvasParent.style.width = "100%";

        // ! aici verific din cauza ca se creeaza 2 canvasuri cand e cu React
        const existingCanvas = document.getElementById(`pixi-canvas`);
        if (existingCanvas) {
            existingCanvas.remove();
        }

        const app = new Application(config);
        this.app = app;

        app.ticker.minFPS = 60;

        new Stats(app.renderer, app.ticker, canvasParent);

        const canvas = app.view as HTMLCanvasElement;
        canvas.id = `pixi-canvas`;
        canvas.style.position = `absolute`;
        canvas.style.width = `100%`;
        canvas.style.height = `100%`;
        canvas.style.touchAction = `none`;
        canvas.style.display = `block`;
        canvasParent.appendChild(canvas);

        // dev tools
        (globalThis as any).__PIXI_APP__ = app;

        const resizeCanvas = () => {
            const canvasParentRect = canvasParent.getBoundingClientRect();
            const { width } = canvasParentRect;
            const { height } = canvasParentRect;

            app.renderer.resize(width, height);

            const scaleX = width / config.width;
            const scaleY = height / config.height;
            let scale = Math.min(scaleX, scaleY);

            if (width < height) {
                if (width < 640) {
                    scale *= 1.72;
                } else if (width < 800) {
                    scale *= 1.66;
                } else if (width < 960) {
                    scale *= 1.5;
                } else {
                    scale *= 1.3;
                }

                const scaleFactor = height / width;

                if (scaleFactor > 1 && scaleFactor < 1.1) {
                    scale *= 0.96;
                }
            } else {
                let scaleFactor = width / height;
                if (scaleFactor >= 1 && scaleFactor < 1.3) {
                    scale *= 1.24;
                }
            }

            app.stage.scale.set(scale);
            app.stage.position.set(
                (width - config.width * scale) * 0.5,
                (height - config.height * scale) * 0.5
            );

            this.modules.ui.resize.bind(this.modules.ui, {
                scaleFactor: scale,
                windowWidth: width,
                windowHeight: height
            })();

            this.modules.background.resize.bind(this.modules.background, {
                scaleFactor: scale,
                windowWidth: width,
                windowHeight: height
            })();
        };

        window.addEventListener(`resize`, resizeCanvas);

        resizeCanvas();

        app.stage.addChild(this.modules.background);

        app.stage.addChild(this.modules.intro);

        this.app.stage.addChild(this.modules.sound);

        canvas.addEventListener(
            "pointerdown",
            () => {
                goFullscreen();
            },
            { once: true }
        );

        function goFullscreen() {
            const el = document.documentElement;

            if (el.requestFullscreen) el.requestFullscreen();
            else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
            else if ((el as any).msRequestFullscreen) (el as any).msRequestFullscreen();
        }

        document.addEventListener("fullscreenchange", () => {
            app.renderer.resize(window.innerWidth, window.innerHeight);
        });
    }

    protected getAssetsConfig() {
        return assetsConfig;
    }

    protected async initializeModules(): Promise<void> {
        console.log(`%cGameManager: Initializing modules`, this.getConsoleLogStyle());

        this.modules = {
            background: new BackgroundModule(backgroundConfig),
            games: new GamesModule(gamesConfig),
            sound: new SoundModule(soundConfig),
            ui: new UiModule({}),
            connection: new ConnectionModule(),
            intro: new IntroModule()
        };

        this.games = [];

        console.log(`%cGameManager: All modules initialized`, this.getConsoleLogStyle());
    }

    protected async initializeStateMachine(): Promise<void> {
        this.stateMachine = new StateMachine(gameStatesConfig);
    }

    async start(userId: string): Promise<void> {
        if (GameManager.isInitialized) {
            console.log(`GameManager already initialized, skipping start`);
            return;
        }
        GameManager.isInitialized = true;

        this.userId = userId;

        console.log(`%cGameManager: starting with userID: ${userId}`, this.getConsoleLogStyle());

        await this.initialize();
    }

    protected getConsoleLogStyle(): string {
        return `color: black; background-color: orange; font-weight: bold;`;
    }
}
