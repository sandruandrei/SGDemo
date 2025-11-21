import {Container, Graphics, Sprite, Text, TextStyle, Texture} from "pixi.js";
import {Side} from "../../abstracts/types/enums.ts";
import {EmojiData} from "../../abstracts/types/interfaces.ts";
import {Avatar} from "./Avatar.ts";

export class MagicMessage extends Container {
    public side: Side;

    constructor(
        name: string,
        avatarTexture: Texture,
        message: string,
        side: Side,
        emojiMap?: Map<string, EmojiData>
    ) {
        super();

        this.side = side;

        const style = new TextStyle({
            wordWrap: true,
            wordWrapWidth: 880,
            fontSize: 38
        });

        const messageTextContainer = this.parseMessageWithEmojis(message, style, emojiMap);
        messageTextContainer.y = 40;

        const avatar = new Avatar(avatarTexture);
        avatar.y = 8;

        const minHeight = Math.max(avatar.height + 16, messageTextContainer.height + 16);

        if (messageTextContainer.height < avatar.height) {
            messageTextContainer.y = avatar.y + avatar.height / 2 - messageTextContainer.height / 2;

            if (messageTextContainer.y < 40) {
                messageTextContainer.y = 40;
            }

            if (messageTextContainer.height < 40) {
                messageTextContainer.y = 50;
            }
        }

        const background = new Graphics();
        background.beginFill(side === Side.LEFT ? 0xffffff : 0xf0faef);
        background.drawRoundedRect(0, 0, messageTextContainer.width + 126, minHeight, 12);
        background.drawRect(
            side === Side.LEFT ? 0 : messageTextContainer.width + 126 - 30,
            minHeight - 30,
            30,
            30
        );
        background.endFill();

        this.addChild(background);

        const nameLine = new Graphics();
        nameLine.name = "NameLine";
        nameLine.lineStyle(1, 0xdddddd);
        nameLine.moveTo(0, 0);
        nameLine.lineTo(background.width - avatar.width / 2 - 2, 0);
        nameLine.endFill();
        nameLine.x = side === Side.LEFT ? 22 : background.width - nameLine.width - 20;
        nameLine.y = 30;
        this.addChild(nameLine);

        avatar.x = side === Side.LEFT ? 8 : background.width - avatar.width - 8;
        this.addChild(avatar);

        const nameText = new Text(name, {
            ...style,
            fontSize: 34,
            fill: 0xaaaaaa,
            fontStyle: name === "Neighbour" ? "italic" : "normal"
        });
        nameText.resolution = window.devicePixelRatio || 2;
        nameText.scale.set(0.5);
        nameText.x = side === Side.LEFT ? 106 : background.width - nameText.width - 102;
        nameText.y = 7;

        this.addChild(nameText);

        messageTextContainer.x =
            side === Side.LEFT
                ? nameText.x
                : nameText.x + nameText.width - messageTextContainer.width;
        this.addChild(messageTextContainer);
    }

    private parseMessageWithEmojis(
        message: string,
        style: TextStyle,
        emojiMap?: Map<string, EmojiData>
    ): Container {
        const container = new Container();

        const originalEmojiFlag = message.match(/\{.*?\}/)?.[0] || "";

        // If no emoji, just return simple text
        if (!originalEmojiFlag || !emojiMap) {
            const messageText = new Text(message, style);
            messageText.resolution = window.devicePixelRatio || 2;
            messageText.scale.set(0.5);
            container.addChild(messageText);
            return container;
        }

        const emojiKey = originalEmojiFlag.replace(/[{}]/g, "");
        const emojiData = emojiMap.get(emojiKey);

        // If emoji not found, just show text as-is
        if (!emojiData?.texture) {
            const messageText = new Text(message, style);
            messageText.resolution = window.devicePixelRatio || 2;
            messageText.scale.set(0.5);
            container.addChild(messageText);
            return container;
        }

        const wordWrapWidth = style.wordWrapWidth || 880;
        const scaledWordWrap = wordWrapWidth / 2; // Account for 0.5 scale
        const lineHeight = 19 * 1.2; // fontSize * line spacing after scale

        let currentX = 0;
        let currentY = 0;

        // Split message into words and emoji placeholder
        const parts = message.split(originalEmojiFlag);
        const beforeEmoji = parts[0] || "";
        const afterEmoji = parts[1] || "";

        // Process text word by word to match PixiJS wrapping
        const processText = (text: string) => {
            const words = text.split(/(\s+)/);
            const measureStyle = new TextStyle({ ...style, wordWrap: false });

            words.forEach((word) => {
                if (!word) return;

                const wordText = new Text(word, measureStyle);
                wordText.resolution = window.devicePixelRatio || 2;
                wordText.scale.set(0.5);
                const wordWidth = wordText.width;

                // Check if word needs to wrap
                if (currentX + wordWidth > scaledWordWrap && currentX > 0) {
                    currentX = 0;
                    currentY += lineHeight;
                }

                wordText.x = currentX;
                wordText.y = currentY;
                container.addChild(wordText);
                currentX += wordWidth;
            });
        };

        // Add text before emoji
        processText(beforeEmoji);

        // Add emoji sprite
        const sprite = new Sprite(emojiData.texture);
        const scale = 20 / sprite.height;
        sprite.scale.set(scale);
        const spriteWidth = sprite.width;

        // Check if emoji needs to wrap
        if (currentX + spriteWidth > scaledWordWrap && currentX > 0) {
            currentX = 0;
            currentY += lineHeight;
        }

        sprite.x = currentX;
        sprite.y = currentY + 2;
        container.addChild(sprite);
        currentX += spriteWidth;

        // Add text after emoji
        processText(afterEmoji);

        return container;
    }
}
