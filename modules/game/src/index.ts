import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import * as PIXI from "pixi.js";
import {GameManager} from "./GameManager.ts";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

// Configure PixiJS Assets base path for GitHub Pages
PIXI.Assets.resolver.basePath = import.meta.env.BASE_URL || "/";
console.log("PixiJS Assets base path set to:", PIXI.Assets.resolver.basePath);

window.addEventListener("load", () => {
    document.body.style.margin = "0px";
    document.body.style.padding = "0px";
    document.body.style.background = "#431c5c";

    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loading";
    loadingDiv.style.position = "absolute";
    loadingDiv.style.top = "0";
    loadingDiv.style.left = "0";
    loadingDiv.style.width = "100%";
    loadingDiv.style.height = "100%";
    loadingDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    loadingDiv.style.display = "flex";
    loadingDiv.style.justifyContent = "center";
    loadingDiv.style.alignItems = "center";
    loadingDiv.style.zIndex = "9999";
    loadingDiv.innerHTML = `
        <div style="position: absolute; text-align: center; color: white; font-size: 8px; font-family: sans-serif">
            <div style="width: 100px; height: 100px; border: 6px solid rgba(255, 255, 255, 0.3); border-top: 6px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <h1 style="margin-top: -84px;">Loading...</h1>
        </div>
       
    `;
    document.body.appendChild(loadingDiv);
});

const gameManager = new GameManager();
gameManager.start("RandomUser");
