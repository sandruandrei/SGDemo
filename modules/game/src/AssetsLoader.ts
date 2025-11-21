import {Howl} from "howler";
import {Assets, BaseTexture, SVGResource, Texture} from "pixi.js";
import {signalsManager} from "./abstracts/signals/SignalsManager.ts";
import {SignalNames} from "./abstracts/types/enums.ts";
import {AssetManifest, LoadingError} from "./abstracts/types/types.ts";

class AssetsLoader {
    private static instance: AssetsLoader;
    private manifest?: AssetManifest;
    private isLoading = false;
    private basePath: string = '';

    // Asset storage maps
    private readonly assets = {
        images: new Map<string, string>(),
        spritesheets: new Map<string, string>(),
        audio: new Map<string, string>(),
        videos: new Map<string, string>(),
        svgs: new Map<string, string>(),
        fonts: {
            ttf: new Map<string, string>(),
            bitmap: new Map<string, string>()
        }
    };

    // Loaded assets storage
    private readonly loaded = {
        textures: new Map<string, Texture>(),
        videos: new Map<string, HTMLVideoElement>(),
        audio: new Map<string, Howl>(),
        svgs: new Map<string, Texture>(),
        fonts: {
            ttf: new Map<string, FontFace>(),
            bitmap: new Map<string, Texture>()
        }
    };

    private constructor() {
        // Get base path from Vite's import.meta.env
        this.basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
        this.logWithStyle(`Initialized with base path: ${this.basePath}`);
    }

    public static getInstance(): AssetsLoader {
        if (!AssetsLoader.instance) {
            AssetsLoader.instance = new AssetsLoader();
        }
        return AssetsLoader.instance;
    }

    public setManifest(manifest: AssetManifest): void {
        this.logWithStyle(`Setting manifest`);
        this.manifest = manifest;
        this.handleManifest();
    }

    private handleManifest(): void {
        if (!this.manifest) return;

        // Clear all asset maps
        Object.values(this.assets).forEach((map) => {
            if (map instanceof Map) {
                map.clear();
            } else if (typeof map === `object`) {
                Object.values(map).forEach((subMap) => subMap.clear());
            }
        });

        type FontType = `ttf` | `bitmap`;
        const isFontType = (type: string): type is FontType => type === `ttf` || type === `bitmap`;

        const isValidPath = (value: unknown): value is string =>
            typeof value === `string` && value.length > 0;

        // Load assets into maps
        const manifestToAssetMap = {
            images: this.assets.images,
            spritesheets: this.assets.spritesheets,
            audio: this.assets.audio,
            videos: this.assets.videos,
            fonts: this.assets.fonts,
            svgs: this.assets.svgs
        };

        Object.entries(manifestToAssetMap).forEach(([key, target]) => {
            const source = this.manifest![key as keyof AssetManifest];
            if (source) {
                if (key === `fonts`) {
                    Object.entries(source).forEach(([fontType, fonts]) => {
                        if (isFontType(fontType)) {
                            Object.entries(fonts).forEach(([name, path]) => {
                                if (isValidPath(path)) {
                                    this.assets.fonts[fontType].set(name, path);
                                } else {
                                    this.logError(
                                        `Invalid path for font "${name}" in type "${fontType}"`
                                    );
                                }
                            });
                        }
                    });
                } else {
                    Object.entries(source).forEach(([name, path]) => {
                        if (isValidPath(path)) {
                            (target as Map<string, string>).set(name, path);
                        } else {
                            this.logError(`Invalid path for asset "${name}" in ${key}`);
                        }
                    });
                }
            }
        });

        this.logAssetCounts();
    }

    private async loadAudioFiles(): Promise<void> {
        const loadPromises = Array.from(this.assets.audio.entries()).map(async ([key, path]) => {
            const fullPath = this.getFullPath(path);
            this.logWithStyle(`Loading audio "${key}" from ${fullPath}`);
            try {
                await new Promise<void>((resolve, reject) => {
                    const sound = new Howl({
                        src: [fullPath],
                        preload: true,
                        autoplay: false,
                        onload: () => {
                            this.logWithStyle(`Audio "${key}" loaded successfully`);
                            this.loaded.audio.set(key, sound);
                            resolve();
                        },
                        onloaderror: (_, err) => {
                            this.logError(`Failed to load audio "${key}"`, err);
                            reject(new Error(`Failed to load audio: ${fullPath}`));
                        }
                    });
                });
            } catch (err) {
                this.logError(`Failed to load audio "${key}"`, err);
                throw err;
            }
        });

        await Promise.all(loadPromises);
    }

    public async start(): Promise<void> {
        if (this.isLoading) {
            this.logWithStyle(`Already loading assets`);
            return;
        }

        this.isLoading = true;
        const startTime = Date.now();

        try {
            const totalFiles = this.getTotalAssetCount();
            this.logWithStyle(`Starting loading ${totalFiles} files`);

            if (totalFiles > 0) {
                await Promise.all([
                    this.loadImages(),
                    this.loadVideos(),
                    this.loadAudioFiles(),
                    this.loadSvgs(),
                    this.loadFonts()
                ]);
            }

            this.logWithStyle(
                `Successfully loaded ${totalFiles} files in ${Date.now() - startTime}ms`
            );
            signalsManager.emit(SignalNames.LOADING_COMPLETE);
        } catch (err) {
            const error: LoadingError = { message: `Failed to load assets`, details: err };
            signalsManager.emit(SignalNames.LOADING_FAILED, error);
            throw err;
        } finally {
            this.isLoading = false;
        }
    }

    private async loadImages(): Promise<void> {
        const promises = Array.from(this.assets.images.entries()).map(async ([key, path]) => {
            const fullPath = this.getFullPath(path);
            this.logWithStyle(`Loading image "${key}" from ${fullPath}`);
            try {
                const texture = await Assets.load(fullPath);
                this.loaded.textures.set(key, texture);
            } catch (err) {
                this.logError(`Failed to load image "${key}"`, err);
                throw err;
            }
        });
        await Promise.all(promises);
    }

    private async loadVideos(): Promise<void> {
        const promises = Array.from(this.assets.videos.entries()).map(async ([key, path]) => {
            const fullPath = this.getFullPath(path);
            this.logWithStyle(`Loading video "${key}" from ${fullPath}`);
            const video = document.createElement(`video`);
            video.src = fullPath;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;

            await new Promise((resolve, reject) => {
                video.onloadeddata = () => resolve(true);
                video.onerror = () => reject(new Error(`Failed to load video: ${fullPath}`));
            });

            this.loaded.videos.set(key, video);
        });
        await Promise.all(promises);
    }

    private async loadSvgs(): Promise<void> {
        const promises = Array.from(this.assets.svgs.entries()).map(async ([key, path]) => {
            const fullPath = this.getFullPath(path);
            this.logWithStyle(`Loading SVG "${key}" from ${fullPath}`);
            try {
                const response = await fetch(fullPath);
                const svgString = await response.text();
                const svgResource = new SVGResource(svgString);
                const baseTexture = new BaseTexture(svgResource);
                const texture = new Texture(baseTexture);
                this.loaded.svgs.set(key, texture);
            } catch (err) {
                this.logError(`Failed to load SVG "${key}"`, err);
                throw err;
            }
        });
        await Promise.all(promises);
    }

    private async loadFonts(): Promise<void> {
        const ttfPromises = Array.from(this.assets.fonts.ttf.entries()).map(async ([key, path]) => {
            const fullPath = this.getFullPath(path);
            this.logWithStyle(`Loading TTF font "${key}" from ${fullPath}`);
            try {
                const fontFace = new FontFace(key, `url(${fullPath})`);
                await fontFace.load();
                document.fonts.add(fontFace);
                this.loaded.fonts.ttf.set(key, fontFace);
            } catch (err) {
                this.logError(`Failed to load TTF font "${key}"`, err);
                throw err;
            }
        });

        const bitmapPromises = Array.from(this.assets.fonts.bitmap.entries()).map(
            async ([key, path]) => {
                const fullPath = this.getFullPath(path);
                this.logWithStyle(`Loading bitmap font "${key}" from ${fullPath}`);
                try {
                    await Assets.load(fullPath);
                    const texture = Assets.get(fullPath);
                    this.loaded.fonts.bitmap.set(key, texture);
                } catch (err) {
                    this.logError(`Failed to load bitmap font "${key}"`, err);
                    throw err;
                }
            }
        );

        await Promise.all([...ttfPromises, ...bitmapPromises]);
    }

    // Asset getters
    public getTexture(name: string): Texture {
        this.logWithStyle(`Getting texture "${name}"`);
        const texture = this.loaded.textures.get(name);
        if (!texture) {
            this.logError(`Texture "${name}" not found in loaded textures`);
            throw new Error(`Texture "${name}" not found`);
        }
        return texture;
    }

    public getVideo(name: string): HTMLVideoElement {
        const video = this.loaded.videos.get(name);
        if (!video) {
            throw new Error(`Video not found: ${name}`);
        }
        return video;
    }

    public getAudio(name: string): Howl | undefined {
        const sound = this.loaded.audio.get(name);
        if (!sound) {
            this.logWarning(`Audio "${name}" not found in loaded audio`);
        }
        return sound;
    }

    public getLoadedAudioKeys(): string[] {
        return Array.from(this.loaded.audio.keys());
    }

    public getSvg(name: string): Texture {
        this.logWithStyle(`Getting SVG "${name}"`);
        const texture = this.loaded.svgs.get(name);
        if (!texture) {
            this.logError(`SVG "${name}" not found in loaded SVGs`);
            throw new Error(`SVG "${name}" not found`);
        }
        return texture;
    }

    public getTtfFont(name: string): FontFace {
        this.logWithStyle(`Getting TTF font "${name}"`);
        const font = this.loaded.fonts.ttf.get(name);
        if (!font) {
            this.logError(`TTF font "${name}" not found in loaded fonts`);
            throw new Error(`TTF font "${name}" not found`);
        }
        return font;
    }

    public getBitmapFont(name: string): Texture {
        this.logWithStyle(`Getting bitmap font "${name}"`);
        const texture = this.loaded.fonts.bitmap.get(name);
        if (!texture) {
            this.logError(`Bitmap font "${name}" not found in loaded fonts`);
            throw new Error(`Bitmap font "${name}" not found`);
        }
        return texture;
    }

    // Utility methods
    private getTotalAssetCount(): number {
        return Array.from(Object.values(this.assets)).reduce((total, map) => {
            if (map instanceof Map) {
                return total + map.size;
            } else if (typeof map === `object`) {
                return total + Object.values(map).reduce((sum, subMap) => sum + subMap.size, 0);
            }
            return total;
        }, 0);
    }

    private logWithStyle(message: string, ...args: any[]): void {
        console.log(
            `%c📦 AssetsLoader: ${message}`,
            `color: yellow; background-color: darkblue; font-weight: bold;`,
            ...args
        );
    }

    private logError(message: string, ...args: any[]): void {
        console.error(
            `%c📦 AssetsLoader: ${message}`,
            `color: red; background-color: black; font-weight: bold;`,
            ...args
        );
    }

    private logWarning(message: string, ...args: any[]): void {
        console.warn(
            `%c📦 AssetsLoader: ${message}`,
            `color: orange; background-color: black; font-weight: bold;`,
            ...args
        );
    }

    private getFullPath(path: string): string {
        // If path is already absolute (starts with http:// or https://), return as is
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        // Prepend base path for relative paths
        return this.basePath + path;
    }

    private logAssetCounts(): void {
        const counts = {
            images: this.assets.images.size,
            spritesheets: this.assets.spritesheets.size,
            audio: this.assets.audio.size,
            videos: this.assets.videos.size,
            ttfFonts: this.assets.fonts.ttf.size,
            bitmapFonts: this.assets.fonts.bitmap.size,
            svgs: this.assets.svgs.size
        };

        this.logWithStyle(`Processed manifest with ${this.getTotalAssetCount()} total assets:`);
        Object.entries(counts).forEach(([type, count]) => {
            this.logWithStyle(`${type}: ${count}`);
        });
    }
}

export const assetsLoader = AssetsLoader.getInstance();
