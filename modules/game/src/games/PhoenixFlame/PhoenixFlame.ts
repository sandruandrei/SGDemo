import {gsap} from "gsap";
import {Container, Sprite} from "pixi.js";
import {assetsLoader} from "../../AssetsLoader.ts";
import {AbstractGame} from "../../abstracts/stateManagement/games/AbstractGame.ts";
import {SoundsManager} from "../../abstracts/stateManagement/modules/SoundModule.ts";
import {GameName, ImageName, SoundNames} from "../../abstracts/types/enums.ts";
import {FireParticle} from "./FireParticle.ts";

export class PhoenixFlame extends AbstractGame {
    private particles!: FireParticle[];
    private particlesContainer!: Container;
    private generatorStopped: boolean = false;

    constructor() {
        super(GameName.PHOENIX_FLAME);
    }

    protected override async init() {
        await super.init();

        const customBackground = new Sprite(assetsLoader.getTexture(ImageName.PHOENIX_FLAME));
        customBackground.name = "CustomBackground";
        customBackground.width = this.width;
        customBackground.height = this.height;
        this.addChild(customBackground);

        this.generateParticles();

        const frame = new Sprite(assetsLoader.getTexture(ImageName.PHOENIX_FLAME_FRAME));
        frame.scale.set(customBackground.scale.x, customBackground.scale.y);
        frame.x = 77;
        frame.y = 147;
        this.addChild(frame);

        this.addChild(this.overgroundUI);
    }

    private generateParticles(): void {
        this.particles = [];
        this.particlesContainer = new Container();
        this.particlesContainer.name = "FireContainer";
        this.particlesContainer.x = 120;
        this.particlesContainer.y = 370;

        this.addChild(this.particlesContainer);
        this.particlesContainer.visible = false;

        for (let i = 0; i < 10; i++) {
            const particle = new FireParticle();
            particle.x = i * 14;

            particle.defaultX = particle.x;

            this.particlesContainer.addChild(particle);
            this.particles.push(particle);
        }
    }

    protected override onPlayButtonClicked() {
        super.onPlayButtonClicked();

        this.runFire();
    }

    private runFire() {
        this.particlesContainer.visible = true;
        this.generatorStopped = false;

        const randomPosNeg = () => (Math.random() > 0.5 ? 1 : -1);
        const animateParticle = (particle: FireParticle) => {
            if (this.generatorStopped) {
                return;
            }
            const randomScale = 1 + Math.random() / 10;

            const newPos = randomPosNeg() * Math.random() * 6 + particle.defaultX;

            particle.rotation = randomPosNeg() * ((Math.random() * 10) / 40);
            gsap.fromTo(
                particle,
                {
                    x: newPos,
                    pixi: {
                        scaleX: randomScale,
                        scaleY: 0.2,
                        y: Math.random() * 10,
                        blur: 3 + Math.random(),
                        colorize: "#dfce16",
                        colorizeAmount: 0
                    }
                },
                {
                    x: particle.defaultX,
                    pixi: {
                        scaleX: 0.2 + Math.random() / 9,
                        scaleY: 1.6 + Math.random(),
                        colorize: "#f68d1c",
                        colorizeAmount: 0.8
                    },
                    duration: 0.2 + Math.random() / 5,
                    onComplete: () => {
                        animateParticle(particle);
                    }
                }
            );
        };

        this.particles.forEach((particle) => {
            animateParticle(particle);
        });
    }

    protected override getBackgroundColor(): number {
        return 0xab2b86;
    }

    protected onStart(): Promise<void> {
        return Promise.resolve().then(() => {
            SoundsManager.changeMainTheme(SoundNames.GAME3);
        });
    }

    public override reset(): Promise<void> {
        this.particles.forEach((particle) => {
            particle.reset();
        });

        this.particlesContainer.visible = false;

        this.overgroundUI.removeChild(this.replayBtn);
        this.replayBtn.reset();

        this.playBtn.reset();
        this.overgroundUI.addChild(this.playBtn);

        this.gameTimeline?.kill();

        this.addChild(this.overgroundUI);

        this.generatorStopped = true;

        return Promise.resolve(undefined);
    }
}
