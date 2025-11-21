import {assetsLoader} from "./AssetsLoader";
import {signalsManager} from "./abstracts/signals/SignalsManager.ts"; // import {IdlePresentation} from "./games/IdlePresentation";
import {GameState, SignalNames} from "./abstracts/types/enums.ts";
import {IGameState, IStateMachine} from "./abstracts/types/interfaces.ts";

export class StateMachine implements IStateMachine {
    private currentState!: GameState;

    constructor(private readonly config: IGameState[]) {
        this.log(`Initializing`);
        this.start();
    }

    private async start(): Promise<void> {
        this.setupSignalsHandlers();
        this.currentState = GameState.INITIAL;
        await this.next(GameState.LOADING_ASSETS);
    }

    private setupSignalsHandlers(): void {
        this.log(`Setting up signal handlers`);
    }

    private async handleStateChange(): Promise<void> {
        this.log(`Handling state change`, {
            state: this.currentState
        });

        const stateHandlers: Partial<Record<GameState, () => Promise<void>>> = {
            [GameState.LOADING_ASSETS]: async () => {
                this.log(`Loading assets`);
                await assetsLoader.start();
            },
            [GameState.LOADING_COMPLETE]: async () => {
                await this.next(GameState.CONNECTING_TO_SERVER);
            },
            [GameState.CONNECTING_TO_SERVER]: async () => {
                signalsManager.emit(SignalNames.CONNECT_TO_SERVER);
            },
            [GameState.AUTH_STARTED]: async () => {
                signalsManager.emit(SignalNames.START_AUTH);
            },
            [GameState.AUTH_COMPLETE]: async () => {
                await this.next(GameState.INITIALIZED);
            },
            [GameState.INITIALIZED]: async () => {
                signalsManager.emit(SignalNames.CHANGE_GAME);
            },
            [GameState.CHANGE_GAME]: async () => {},
            [GameState.PLAY_GAME]: async () => {}
        };

        const handler = stateHandlers[this.currentState];
        if (handler) {
            await handler();
            return;
        }
    }

    public async next(to: GameState): Promise<void> {
        const currentStateConfig = this.config.find((state) => state.default === this.currentState);
        if (!currentStateConfig) {
            this.log(`Cannot transition - No state config found`, {
                currentState: this.currentState
            });
            return;
        }

        const validTransition = currentStateConfig.flows.some(
            (flow) => flow.when() && flow.next === to
        );

        if (!validTransition) {
            this.log(`Invalid state transition requested`, {
                from: this.currentState,
                to
            });
            return;
        }

        this.log(`Transitioning to requested state`, {
            from: this.currentState,
            to
        });
        this.currentState = to;
        await this.handleStateChange();
    }

    private log(message: string, ...args: any[]): void {
        console.log(
            `%c𖠌 StateMachine: ${message} ▶`,
            `color: black; background-color: yellow; font-weight: bold;`,
            ...args
        );
    }
}
