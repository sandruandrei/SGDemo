import {AbstractGame} from "../games/AbstractGame.ts";
import {AbstractModule} from "./AbstractModule";

export class GamesModule extends AbstractModule {
    protected currentGame: AbstractGame | undefined;

    constructor(config: object = {}) {
        super(config);
        this.init();

        this.scale.set(0.95);
        this.x = 12;
        this.y = 74;
    }

    protected override getModuleName(): string {
        return `ReelsModule`;
    }

    protected override handleConfig(): void {}

    protected override setupSignalsHandlers(): void {}

    public override resize(): void {}

    public override reset(): void {}

    protected override getConsoleLogTextColor(): string {
        return `cyan`;
    }

    public changeGame(game: AbstractGame) {
        game.x = 300;
        game.y = 40;

        if (this.currentGame) {
            this.removeChild(this.currentGame);
        }

        this.addChild(game);

        this.currentGame?.reset();
        this.currentGame = game;

        game.start();
    }
}
