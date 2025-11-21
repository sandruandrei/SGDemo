import {FontsNames, GameName, GameState, ImageName, SoundNames, SvgName} from "./types/enums";
import {GameConfig, IGameState} from "./types/interfaces";
import {AssetManifest, BackgroundManifest} from "./types/types";

export const gameStatesConfig: IGameState[] = [
    {
        default: GameState.INITIAL,
        flows: [{ next: GameState.LOADING_ASSETS, when: () => true }]
    },
    {
        default: GameState.LOADING_ASSETS,
        flows: [{ next: GameState.LOADING_COMPLETE, when: () => true }]
    },
    {
        default: GameState.LOADING_COMPLETE,
        flows: [{ next: GameState.CONNECTING_TO_SERVER, when: () => true }]
    },
    {
        default: GameState.CONNECTING_TO_SERVER,
        flows: [{ next: GameState.AUTH_STARTED, when: () => true }]
    },
    {
        default: GameState.AUTH_STARTED,
        flows: [{ next: GameState.AUTH_COMPLETE, when: () => true }]
    },
    {
        default: GameState.AUTH_COMPLETE,
        flows: [{ next: GameState.INITIALIZED, when: () => true }]
    },
    {
        default: GameState.INITIALIZED,
        flows: [{ next: GameState.CHANGE_GAME, when: () => true }]
    },
    {
        default: GameState.CHANGE_GAME,
        flows: [{ next: GameState.PLAY_GAME, when: () => true }]
    },
    {
        default: GameState.PLAY_GAME,
        flows: [{ next: GameState.CHANGE_GAME, when: () => true }]
    }
];

export const assetsConfig: AssetManifest = {
    images: {
        [ImageName.NORMAL_BG]: `/images/bg/normal.png`,
        [ImageName.FS_BG]: `/images/bg/fs.png`,
        [ImageName.SFS_BG]: `/images/bg/sfs.png`,
        [ImageName.PHOENIX_FLAME]: `/images/bg/Imfine.png`,
        [ImageName.PHOENIX_FLAME_FRAME]: `/images/misc/ImfinePaintingFrame.png`,
        [ImageName.UNKNOWN_AVATAR]: `/images/avatars/avatar.png`,
        [ImageName.LOADER]: `/images/misc/loadingIcon.png`,
        [ImageName.WIN_EMOJI]: `/images/emojies/win.png`,
        [ImageName.AFFIRMATIVE_EMOJI]: `/images/emojies/affirmative.png`,
        [ImageName.NEUTRAL]: `/images/emojies/neutral.png`
    },
    spritesheets: {},
    videos: {
    },
    audio: {
        [SoundNames.GAME1]: `/sounds/game1.mp3`,
        [SoundNames.GAME2]: `/sounds/game2.mp3`,
        [SoundNames.GAME3]: `/sounds/game3.mp3`
    },
    svgs: {
        [SvgName.PLAY_ICON]: `/svgs/playIcon.svg`,
        [SvgName.PLAY_ICON_SILVER]: `/svgs/playIconSilver.svg`,
        [SvgName.REPLAY_ICON]: `/svgs/replayIcon.svg`,
        [SvgName.FAST_ICON]: `/svgs/fastIcon.svg`,
        [SvgName.STAR_ICON]: `/svgs/starIcon.svg`,
        [SvgName.SOUND_ON]: `/svgs/soundOn.svg`,
        [SvgName.SOUND_OFF]: `/svgs/soundOff.svg`
    },
    fonts: {
        ttf: {},
        bitmap: {
            [FontsNames.MENU_FONT]: `/fonts/bitmapFonts/menuFont.fnt`
        }
    }
};

export const gameConfig: GameConfig = {
    gamesNames: [GameName.ACE_OF_SHADOWS, GameName.MAGIC_WORDS, GameName.PHOENIX_FLAME],
    display: {
        width: 1280,
        height: 800
    }
};

export const pixiConfig = {
    width: gameConfig.display.width,
    height: gameConfig.display.height,
    backgroundColor: 0x000000,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 2
};

export const backgroundConfig: BackgroundManifest = {
    [GameName.ACE_OF_SHADOWS]: { id: ImageName.NORMAL_BG },
    [GameName.PHOENIX_FLAME]: { id: ImageName.SFS_BG },
    [GameName.MAGIC_WORDS]: { id: ImageName.FS_BG }
};

export const gamesConfig = {};

export const soundConfig = {};
