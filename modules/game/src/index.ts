import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import * as PIXI from "pixi.js";
import {GameManager} from "./GameManager.ts";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const gameManager = new GameManager();
gameManager.start("RandomUser");
