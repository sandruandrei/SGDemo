export enum GameState {
    INITIAL = `initial`,
    LOADING_ASSETS = `loadingAssets`,
    LOADING_COMPLETE = `loadingComplete`,
    AUTH_STARTED = `authStarted`,
    AUTH_COMPLETE = `authComplete`,
    CONNECTING_TO_SERVER = `connectingToServer`,
    INITIALIZED = `initialized`,
    PLAY_GAME = `playGame`,
    CHANGE_GAME = `changeGame`
}

export enum GameName {
    ACE_OF_SHADOWS = `ACE  OF  SHADOWS`,
    MAGIC_WORDS = `MAGIC  WORDS`,
    PHOENIX_FLAME = `PHOENIX  FLAME`
}

export enum FontsNames {
    MENU_FONT = "menuFont"
}

export enum SignalNames {
    // START_LOADING = `startLoading`,
    SET_USER_ID = `SET_USER_ID`,
    ///////
    LOADING_COMPLETE = `loadingComplete`,
    LOADING_FAILED = `loadingFailed`,
    ///////
    CONNECT_TO_SERVER = `connectToServer`,
    CONNECTED_TO_SERVER = `connectedToServer`,
    ///////
    START_AUTH = `startAuth`,
    AUTH_COMPLETE = `authComplete`,
    ///////

    GAME_CHANGED = `gameChanged`,
    ///////
    ///////
    SOUND_TOGGLE = `SOUND_TOGGLE`,
    ///////
    CHANGE_GAME = `changeGameRequest`
}

export enum ImageName {
    NORMAL_BG = `normalBg`,
    FS_BG = `fsBg`,
    REELS_BG = `reelsBg`,
    SFS_BG = `sfsBg`,
    PHOENIX_FLAME = `phoenixFlame`,
    PHOENIX_FLAME_FRAME = `phoenixFlameFrame`,
    UNKNOWN_AVATAR = `unknownAvatar`,
    LOADER = `loader`,
    WIN_EMOJI = `win`,
    AFFIRMATIVE_EMOJI = `affirmative`,
    NEUTRAL = `neutral`,
    // do not remove
    NONE = `NONE`
}

export enum SvgName {
    BONUS_BUY_ICON = `bonusBuyIcon`,
    AUTO_SPIN_ICON = `autoSpinIcon`,
    PLAY_ICON = `playIcon`,
    PLAY_ICON_SILVER = `playIconSilver`,
    REPLAY_ICON = `replayIcon`,
    FAST_ICON = `fastIcon`,
    STAR_ICON = `starIcon`,
    SOUND_ON = `soundOn`,
    SOUND_OFF = `soundOff`,
    // do not remove
    NONE = `NONE`
}

export enum VideoNames {
    INTRO_SCREEN = `introScreen`,
    // do not remove
    NONE = `NONE`
}

export enum SoundNames {
    GAME1 = `game1`,
    GAME2 = `game2`,
    GAME3 = `game3`,
    // do not remove
    NONE = `NONE`
}

export enum Side {
    LEFT = `left`,
    RIGHT = `right`
}
