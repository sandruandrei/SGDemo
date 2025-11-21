import gsap from "gsap";
import {Assets, Container, Graphics, Text} from "pixi.js";
import {assetsLoader} from "../../AssetsLoader.ts";
import {AbstractGame} from "../../abstracts/stateManagement/games/AbstractGame.ts";
import {SoundsManager} from "../../abstracts/stateManagement/modules/SoundModule.ts";
import {GameName, ImageName, Side, SoundNames, SvgName} from "../../abstracts/types/enums.ts";
import {AvatarData, EmojiData, MessagesData} from "../../abstracts/types/interfaces.ts";
import {FastButton} from "../../abstracts/ui/buttons/FastButton.ts";
import {isMobile} from "../../abstracts/utils";
import {MagicMessage} from "./MagicMessage.ts";
import {UILoader} from "./UILoader.ts";

const loadMagicWords = async (): Promise<any> => {
    const res = await fetch(
        "https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords"
    );

    if (!res.ok) {
        throw new Error("Failed to fetch magic words");
    }

    const data = await res.json();

    console.log("Magic Words Response:", data);

    return data;
};

export class MagicWords extends AbstractGame {
    private messages!: MagicMessage[];
    private messagesContainer!: Container;
    private initialMessagesContainerY: number = 584;
    private loader!: UILoader;

    constructor() {
        super(GameName.MAGIC_WORDS);

        this.enableWinningAnimation = false;
    }

    protected override getBackgroundColor(): number {
        return 0x03b95a;
    }

    protected override async init(): Promise<void> {
        await super.init();

        // const emojies = data.emojies;

        this.createUXGraphics();

        this.fastButton = new FastButton();
        this.fastButton.changeIconTexture(assetsLoader.getSvg(SvgName.PLAY_ICON_SILVER));
        this.fastButton.x = 599;
        this.fastButton.y = 601;
        this.addChild(this.fastButton);

        this.fastButton.on(isMobile() ? `pointerdown` : `click`, () => {
            if (this.gameTimeline && this.gameTimeline.isActive()) {
                this.gameTimeline.timeScale(4);
            }

            this.fastButton.eventMode = "passive";
        });

        this.fastButton.eventMode = "passive";

        this.overgroundUI.removeChild(this.playBtn);
        this.loader = new UILoader();
        this.loader.x = this.overgroundUI.width / 2;
        this.loader.y = this.overgroundUI.height / 2;
        this.overgroundUI.addChild(this.loader);
        this.loader.start();

        this.addChild(this.overgroundUI);

        this.messages = [];

        this.messagesContainer = new Container();
        this.messagesContainer.name = "MessagesContainer";

        const avatarsMap: Map<string, AvatarData> = new Map();
        const emojiMap: Map<string, EmojiData> = new Map();

        const fetchData = async (): Promise<MessagesData> => {
            const data: MessagesData = await loadMagicWords();

            await Promise.all(
                data.avatars.map(async (avatar) => {
                    const avatarTexture = await Assets.load({
                        src: avatar.url.replace('"', ""),
                        loadParser: "loadTextures"
                    });

                    avatarsMap.set(avatar.name, { ...avatar, texture: avatarTexture });
                })
            );

            await Promise.all(
                data.emojies.map(async (emojiData) => {
                    const avatarTexture = await Assets.load({
                        src: emojiData.url.replace('"', ""),
                        loadParser: "loadTextures"
                    });

                    emojiMap.set(emojiData.name, { ...emojiData, texture: avatarTexture });
                })

                //fallback
            );

            emojiMap.set("win", {
                texture: assetsLoader.getTexture(ImageName.WIN_EMOJI),
                url: "",
                name: "win"
            } as EmojiData);

            emojiMap.set("affirmative", {
                texture: assetsLoader.getTexture(ImageName.AFFIRMATIVE_EMOJI),
                url: "",
                name: "affirmative"
            } as EmojiData);

            emojiMap.set("neutral", {
                texture: assetsLoader.getTexture(ImageName.NEUTRAL),
                url: "",
                name: "neutral"
            } as EmojiData);

            return Promise.resolve(data);
        };

        fetchData().then((data) => {
            data.dialogue.forEach((dialog, dialogIndex) => {
                let avatar = avatarsMap.get(dialog.name)!;

                if (!avatar) {
                    avatar = {
                        name: dialog.name,
                        position: Math.round(Math.random() * 1) === 0 ? Side.LEFT : Side.RIGHT,
                        texture: assetsLoader.getTexture(ImageName.UNKNOWN_AVATAR),
                        url: ""
                    };
                }

                const message = new MagicMessage(
                    avatar.name,
                    avatar.texture,
                    dialog.text,
                    avatar.position,
                    emojiMap
                );

                this.messagesContainer.addChild(message);
                this.messages.push(message);
            });

            this.addMessagesToPositions();

            this.addChild(this.messagesContainer);

            const messagesContainerMask: Graphics = new Graphics();
            messagesContainerMask.name = "MessagesContainerMask";
            messagesContainerMask.beginFill(0x000000);
            messagesContainerMask.drawRect(0, 0, this.messagesContainer.width + 8, 540);
            messagesContainerMask.endFill();
            messagesContainerMask.x = 26;
            messagesContainerMask.y = 30;
            this.addChild(messagesContainerMask);

            this.messagesContainer.mask = messagesContainerMask;

            this.loader.stop();
            this.overgroundUI.removeChild(this.loader);
            this.overgroundUI.addChild(this.playBtn);
        });
    }

    private createUXGraphics(): void {
        const uxGraphics = new Graphics();
        uxGraphics.name = "UXBackground";
        uxGraphics.beginFill(0xf4f4f4);
        uxGraphics.drawRoundedRect(20, 20, this.height - 40, this.height - 40, 10);
        uxGraphics.endFill();
        uxGraphics.beginFill(0xe8e3da);
        uxGraphics.drawRoundedRect(24, 24, this.width - 48, this.height - 48, 10);
        uxGraphics.endFill();
        uxGraphics.lineStyle(1, 0xcccccc);
        uxGraphics.beginFill(0xf4f4f4);
        uxGraphics.drawRoundedRect(20, uxGraphics.height - 100, this.width - 40, 120, 10);
        uxGraphics.endFill();
        uxGraphics.lineStyle(1, 0xdddddd);
        uxGraphics.beginFill(0xffffff);
        uxGraphics.drawRoundedRect(40, uxGraphics.height - 80, this.width - 184, 80, 10);
        uxGraphics.endFill();
        this.addChildAt(uxGraphics, 1);

        const typeHereText = new Text("Typing doesn't work, so press the button...", {
            fontSize: 44,
            fontStyle: "italic",
            fill: 0xadadad
        });
        typeHereText.name = "TypeHereText";
        typeHereText.resolution = window.devicePixelRatio || 2;
        typeHereText.scale.set(0.5);
        typeHereText.x = 80;
        typeHereText.y = this.height - 92;
        this.addChild(typeHereText);
    }

    protected override onPlayButtonClicked(): void {
        super.onPlayButtonClicked();

        this.fastButton.reset();
        this.fastButton.eventMode = "static";

        this.startMessagesDisplayAnimation();
    }

    protected startMessagesDisplayAnimation(): void {
        if (this.gameTimeline) {
            this.gameTimeline.kill();
        }

        this.resetTimeline();

        let tempY: number = this.messagesContainer.y;
        let offsetY: number = 0;
        if (this.messages.length > 1) {
            offsetY = this.messages[1].y - (this.messages[0].y + this.messages[1].height);
        }

        this.messages.forEach((message, messageIndex) => {
            tempY -= message.height + offsetY;

            const delay = messageIndex === 0 ? 0.1 : Math.min(Math.random() + 0.3, 1.4);

            const messageTl = gsap.timeline({
                smoothChildTiming: true,
                autoRemoveChildren: true,
                delay: delay
            });

            const containerTween = gsap.to(this.messagesContainer, {
                y: tempY,
                duration: 0.5,
                ease: "sine.in"
            });

            const messageOriginalX = message.x;
            message.x = message.side === Side.LEFT ? messageOriginalX - 60 : messageOriginalX + 60;

            const messageXTween = gsap.to(message, {
                x: messageOriginalX,
                duration: 0.4,
                delay: 0.06,
                ease: "sine.in"
            });

            messageTl.add(messageXTween, 0);

            message.alpha = 0;
            const messageAlphaTween = gsap.to(message, {
                alpha: 1,
                duration: 0.4,
                delay: 0.06,
                ease: "power3.in"
            });

            messageTl.add(messageAlphaTween, 0);

            messageTl.add(containerTween, 0);

            this.gameTimeline.add(messageTl);
        });

        this.gameTimeline.add(gsap.delayedCall(0.2, () => {}));
    }

    protected onStart(): Promise<void> {
        return Promise.resolve().then(() => {
            SoundsManager.changeMainTheme(SoundNames.GAME2);
        });
    }

    protected addMessagesToPositions(): void {
        let currentHeight: number = 0;

        this.messagesContainer.y = this.initialMessagesContainerY;

        this.messages.forEach((message) => {
            gsap.killTweensOf(message);

            message.x = message.side === Side.LEFT ? 30 : this.width - message.width - 30;
            message.y = currentHeight;
            message.alpha = 0;

            currentHeight += message.height + 14;
        });
    }

    public override reset(): Promise<void> {
        this.overgroundUI.removeChild(this.replayBtn);
        this.replayBtn.reset();

        this.playBtn.reset();
        this.overgroundUI.addChild(this.playBtn);

        this.fastButton.eventMode = "passive";

        this.gameTimeline?.kill();

        this.addChild(this.overgroundUI);

        this.addMessagesToPositions();

        return Promise.resolve(undefined);
    }

    protected onFinish(): Promise<void> {
        return super.onFinish().then(() => {
            this.fastButton.alpha = 0.2;
            this.fastButton.eventMode = "passive";
        });
    }
}
