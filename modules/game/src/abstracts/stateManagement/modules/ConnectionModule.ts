import {signalsManager} from "../../signals/SignalsManager";
import {SignalNames} from "../../types/enums";
import {AbstractModule} from "./AbstractModule";

export class ConnectionModule extends AbstractModule {
    private userId!: string;

    constructor() {
        super(null);

        this.init();
    }

    protected setupSignalsHandlers(): void {
        signalsManager.on(SignalNames.CONNECT_TO_SERVER, async () => {
            console.log(`%cSocketModule: connecting to server`, this.getConsoleLogStyle());
            await this.connectToServer();
        });

        signalsManager.on(SignalNames.SET_USER_ID, async (userId) => {
            this.userId = userId;

            await this.fetchUserData(this.userId);
        });
    }

    private async connectToServer(): Promise<void> {
        signalsManager.emit(SignalNames.CONNECTED_TO_SERVER);
    }

    private async fetchUserData(userId: string): Promise<void> {
        signalsManager.emit(SignalNames.AUTH_COMPLETE, userId);
    }

    protected getModuleName(): string {
        return `ConnectionModule`;
    }

    protected getConsoleLogTextColor(): string {
        return `#87CEEB`; // Light sky blue
    }
}
