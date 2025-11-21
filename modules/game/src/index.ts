import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import * as PIXI from "pixi.js";
import {GameManager} from "./GameManager.ts";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

// Configure PixiJS Assets base path for GitHub Pages
PIXI.Assets.resolver.basePath = import.meta.env.BASE_URL || '/';
console.log('PixiJS Assets base path set to:', PIXI.Assets.resolver.basePath);

const gameManager = new GameManager();
gameManager.start("RandomUser");
