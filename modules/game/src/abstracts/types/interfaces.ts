import {TextStyleAlign, Texture} from "pixi.js";
import {BackgroundModule} from "../stateManagement/modules/BackgroundModule";
import {ConnectionModule} from "../stateManagement/modules/ConnectionModule.ts";
import {GamesModule} from "../stateManagement/modules/GamesModule.ts";
import {IntroModule} from "../stateManagement/modules/IntroModule";
import {SoundModule} from "../stateManagement/modules/SoundModule";
import {UiModule} from "../stateManagement/modules/UiModule";
import {GameName, GameState, Side} from "./enums";
import {SignalCallback} from "./types";

export interface DisplayConfig {
    width: number;
    height: number;
}

export interface GameConfig {
    display: DisplayConfig;
    gamesNames: GameName[];
}

export interface IGame {
    start(): Promise<void>;

    finish(): Promise<void>;

    reset(): Promise<void>;
}

export interface IGameFlow {
    next: GameState;
    when: () => boolean;
}

export interface IGameState {
    default: GameState;
    flows: IGameFlow[];
}

export interface IStateMachine {
    next(to: GameState): Promise<void>;
}

export interface IGameManagerModules {
    background: BackgroundModule;
    games: GamesModule;
    ui: UiModule;
    sound: SoundModule;
    connection: ConnectionModule;
    intro: IntroModule;
}

export interface IGameManager {
    start(userId: string): Promise<void>;
}

export interface ISignalsManager {
    on(signalName: string, callback: SignalCallback): void;

    emit(signalName: string, ...args: any[]): void;
}

export interface IModule {
    onGameChange(gameMode: GameName): void;

    reset(): void;

    resize(resizeParams: { scaleFactor: number; windowWidth: number; windowHeight: number }): void;
}

export interface Sound {
    id: string;
    volume: number;
    loop: boolean;
    sound: Howl;
}

export interface BitmapTextProps {
    text: string;
    style: {
        fontName: string;
        fontSize: number;
        align?: TextStyleAlign;
        tint?: number;
        letterSpacing?: number;
        maxWidth?: number;
    };
}

export interface iEmoji {
    name: string;
    url: string;
}

export interface EmojiData extends iEmoji {
    texture: Texture;
}

export interface iAvatar extends iEmoji {
    position: Side;
}

export interface AvatarData extends iAvatar {
    texture: Texture;
}

export interface iDialog {
    name: string;
    text: string;
}

export interface iEmoji {
    name: string;
    url: string;
}

export interface MessagesData {
    avatars: iAvatar[];
    dialogue: iDialog[];
    emojies: iEmoji[];
}
