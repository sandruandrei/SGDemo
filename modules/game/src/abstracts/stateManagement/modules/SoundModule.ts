import {Howl, Howler} from "howler";
import {assetsLoader} from "../../../AssetsLoader.ts";
import {signalsManager} from "../../signals/SignalsManager.ts";
import {SignalNames, SoundNames} from "../../types/enums.ts";
import {AbstractModule} from "./AbstractModule";

export class SoundModule extends AbstractModule {
    private sounds: Map<string, Howl> = new Map();
    private masterVolume: number = 1;
    private isEnabled: boolean = true;

    constructor(config: any) {
        super(config);

        this.init();
    }

    protected override getModuleName(): string {
        return `SoundModule`;
    }

    protected override init(): void {
        this.name = this.getModuleName();
        this.setupSignalHandlers();
    }

    private initSounds(): void {
        const sounds = assetsLoader.getLoadedAudioKeys();
        for (const key of sounds) {
            const sound = assetsLoader.getAudio(key);
            if (sound) {
                this.sounds.set(key, sound);
                console.log(`%cSoundModule: Registered sound ${key}`, this.getConsoleLogStyle());
            }
        }
    }

    protected setupSignalHandlers(): void {
        signalsManager.on(SignalNames.SOUND_TOGGLE, (isEnabled: boolean) => {
            this.isEnabled = isEnabled;
            console.log(
                `%cSoundModule: Sound ${this.isEnabled ? `ON` : `OFF`}`,
                this.getConsoleLogStyle()
            );
            Howler.mute(!this.isEnabled);
        });

        signalsManager.on(SignalNames.AUTH_COMPLETE, () => {
            this.initSounds();

            SoundsManager.initialize(this);

            console.log(`%c${this.getModuleName()} module initialized`, this.getConsoleLogStyle());
        });
    }

    protected override getConsoleLogTextColor(): string {
        return `lime`;
    }

    public playSound(id: string): void {
        const sound = this.sounds.get(id);
        if (sound) {
            try {
                sound.volume(this.masterVolume);
                sound.play();

                console.log(`%cSoundModule: Playing sound ${id}`, this.getConsoleLogStyle());
            } catch (err) {
                console.error(
                    `%cSoundModule: Error playing sound ${id}`,
                    this.getConsoleLogStyle(),
                    err
                );
            }
        } else {
            console.warn(`%cSoundModule: Sound ${id} not found`, this.getConsoleLogStyle());
        }
    }

    public stopSound(id: string): void {
        const sound = this.sounds.get(id);
        if (sound) {
            sound.stop();
            console.log(`%cSoundModule: Stopped sound ${id}`, this.getConsoleLogStyle());
        }
    }

    public setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        Howler.volume(this.masterVolume);
        console.log(
            `%cSoundModule: Set master volume to ${this.masterVolume}`,
            this.getConsoleLogStyle()
        );
    }
}

export class SoundsManager {
    private static soundModule: SoundModule;
    private static mainTheme: SoundNames = SoundNames.NONE;

    public static initialize(soundModule: SoundModule): void {
        console.log(`%cSoundsManager: Initializing`, `color: orange`);
        this.soundModule = soundModule;
    }

    public static play(id: SoundNames): void {
        if (SoundsManager.soundModule) {
            SoundsManager.soundModule.playSound(id);
        }
    }

    public static changeMainTheme(id: SoundNames): void {
        if (SoundsManager.soundModule) {
            if (this.mainTheme === id) {
                return;
            }

            this.soundModule.stopSound(this.mainTheme);
            SoundsManager.soundModule.playSound(id);

            this.mainTheme = id;
        }
    }

    public static stop(id: SoundNames): void {
        if (SoundsManager.soundModule) {
            SoundsManager.soundModule.stopSound(id);
        }
    }

    public static setMasterVolume(volume: number): void {
        if (SoundsManager.soundModule) {
            SoundsManager.soundModule.setMasterVolume(volume);
        }
    }
}
