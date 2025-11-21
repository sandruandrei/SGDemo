import {GameName, ImageName} from "./enums";

export type SignalCallback = (...args: any[]) => void;

export type LoadingError = {
    message: string;
    code?: string;
    details?: unknown;
};

export type AssetManifest = {
    images?: { [key: string]: string };
    spritesheets?: { [key: string]: string };
    spines?: { [key: string]: string };
    audio?: { [key: string]: string };
    videos?: { [key: string]: string };
    svgs?: { [key: string]: string };
    fonts?: {
        ttf?: { [key: string]: string };
        bitmap?: { [key: string]: string };
    };
};

export type BackgroundManifest = {
    [key in GameName]: {
        id: ImageName;
    };
};
