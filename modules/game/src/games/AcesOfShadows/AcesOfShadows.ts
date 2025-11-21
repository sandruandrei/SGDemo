import gsap from "gsap";
import {Container, Graphics} from "pixi.js";
import {AbstractGame} from "../../abstracts/stateManagement/games/AbstractGame.ts";
import {SoundsManager} from "../../abstracts/stateManagement/modules/SoundModule.ts";
import {GameName, SoundNames} from "../../abstracts/types/enums.ts";
import {FastButton} from "../../abstracts/ui/buttons/FastButton.ts";
import {isMobile} from "../../abstracts/utils";
import {Card, cardHeight, cardWidth} from "./Card.ts";

const shortestAngleDelta = (start: number, end: number = 0) => {
    let delta = (end - start) % (Math.PI * 2);
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    return delta;
};

const cardsNumber = 144;

export class AcesOfShadows extends AbstractGame {
    private cards!: Card[];
    private cardsContainer!: Container;
    private cardsNewDeck!: Graphics;

    constructor() {
        super(GameName.ACE_OF_SHADOWS);
    }

    protected override init(): Promise<void> {
        return super.init().then(() => {
            this.cards = [];

            this.cardsContainer = new Container();
            this.cardsContainer.name = "CardsContainer";
            this.cardsContainer.x = 180;
            this.cardsContainer.y = 580;

            for (let i = 0; i < cardsNumber; i++) {
                const card = new Card();

                this.cardsContainer.addChild(card);
                this.cards.push(card);
            }

            this.addCardsToPositions();

            this.cardsNewDeck = new Graphics();
            this.cardsNewDeck.name = "CardsNewDeck";
            this.cardsNewDeck.lineStyle(4, 0x000000, 0.8);
            this.cardsNewDeck.beginFill(0x000000, 0.1);
            this.cardsNewDeck.drawRoundedRect(0, 0, cardWidth + 20, cardHeight + 20, 10);
            this.cardsNewDeck.endFill();

            this.cardsNewDeck.x = 500;
            this.cardsNewDeck.y =
                this.background.y + this.background.height / 2 - this.cardsNewDeck.height / 2;

            this.addChild(this.cardsNewDeck);

            this.addChild(this.cardsContainer);

            this.fastButton = new FastButton();
            this.fastButton.x = 600;
            this.fastButton.y = 600;
            this.fastButton.alpha = 0.2;

            this.fastButton.on(isMobile() ? `pointerdown` : `click`, () => {
                if (this.gameTimeline && this.gameTimeline.isActive()) {
                    this.gameTimeline.timeScale(10);
                }

                this.fastButton.eventMode = "passive";
                this.fastButton.alpha = 0.2;
            });

            this.fastButton.eventMode = "passive";

            this.addChild(this.fastButton);

            this.addChild(this.overgroundUI);
        });
    }

    protected addCardsToPositions(): void {
        this.cards.forEach((card: Card, cardIndex: number) => {
            card.x = 0;
            card.y = -cardIndex * 3;
            card.rotation = (cardIndex / (cardsNumber - 1)) * (2 * Math.PI);

            this.cardsContainer.addChild(card);
        });
    }

    protected override onPlayButtonClicked(): void {
        super.onPlayButtonClicked();

        this.fastButton.reset();
        this.fastButton.eventMode = "static";

        this.startAnimatingCards();
    }

    private startAnimatingCards(): void {
        const endPoint = this.cardsContainer.toLocal(this.cardsNewDeck.getGlobalPosition());
        endPoint.x += this.cardsNewDeck.width / 2;
        endPoint.y += this.cardsNewDeck.height / 2;

        this.resetTimeline();

        const reversedCards = [...this.cards].reverse();
        reversedCards.forEach((card: Card, cardIndex: number) => {
            const moveCardTween = gsap.to(card, {
                duration: 2,
                x: endPoint.x - cardIndex * 0.1,
                y: endPoint.y - cardIndex * 0.1,
                rotation: card.rotation + shortestAngleDelta(card.rotation),
                ease: "power1.out",
                onStart: () => {
                    this.cardsContainer.addChild(card);
                }
            });

            this.gameTimeline.add(moveCardTween, cardIndex);
        });
    }

    protected override getBackgroundColor(): number {
        return 0x479fcc;
    }

    protected onStart(): Promise<void> {
        return Promise.resolve().then(() => {
            SoundsManager.changeMainTheme(SoundNames.GAME1);
        });
    }

    public override reset(): Promise<void> {
        this.overgroundUI.removeChild(this.winningStarsContainer);
        this.overgroundUI.removeChild(this.replayBtn);
        this.replayBtn.reset();

        this.playBtn.reset();
        this.overgroundUI.addChild(this.playBtn);

        this.fastButton.eventMode = "passive";
        this.fastButton.alpha = 0.2;

        this.gameTimeline?.kill();

        this.addChild(this.overgroundUI);

        this.addCardsToPositions();

        return Promise.resolve(undefined);
    }

    protected onFinish(): Promise<void> {
        return super.onFinish().then(() => {
            this.fastButton.alpha = 0.2;
            this.fastButton.eventMode = "passive";
        });
    }
}
