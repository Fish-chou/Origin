const { chromium } = require("C:/Users/Fish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright");
const { pathToFileURL } = require("url");

(async () => {
    const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
    const errors = [];
    const attachDiagnostics = (page, label) => {
        page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
        page.on("console", (message) => { if (message.type() === "error") errors.push(`${label} console: ${message.text()}`); });
    };

    const resume = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    attachDiagnostics(resume, "resume zip");
    await resume.goto(pathToFileURL("E:/zzc/简历/tmp/zip-check-resume/index.html").href, { waitUntil: "networkidle" });
    const resumeInfo = await resume.evaluate(() => ({
        title: document.title,
        name: document.querySelector("h1")?.innerText,
        projects: document.querySelectorAll(".project-card").length,
        awards: document.querySelectorAll(".award-card").length,
        imagesLoaded: [...document.querySelectorAll(".award-card img, .project-card__visual img")].every((image) => image.complete && image.naturalWidth > 0),
        gameHref: [...document.links].find((link) => link.href.includes("tank-battle"))?.href,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
    }));

    const nestedGame = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    attachDiagnostics(nestedGame, "resume nested game");
    await nestedGame.goto(pathToFileURL("E:/zzc/简历/tmp/zip-check-resume/tank-battle/index.html").href, { waitUntil: "networkidle" });
    const nestedReady = await nestedGame.evaluate(() => ({
        title: document.title,
        gameLoaded: Boolean(window.__tankGame),
        walls: window.__tankGame?.obstacles.length,
        background: getComputedStyle(document.querySelector(".game-stage")).backgroundImage
    }));
    await nestedGame.click("#startButton");
    await nestedGame.waitForTimeout(600);
    const nestedRunning = await nestedGame.evaluate(() => ({ state: window.__tankGame.state, lives: window.__tankGame.player.lives }));

    const game = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    attachDiagnostics(game, "game zip");
    await game.goto(pathToFileURL("E:/zzc/简历/tmp/zip-check-game/index.html").href, { waitUntil: "networkidle" });
    const gameInfo = await game.evaluate(() => ({
        title: document.title,
        gameLoaded: Boolean(window.__tankGame),
        walls: window.__tankGame?.obstacles.length,
        touchControls: getComputedStyle(document.querySelector(".touch-controls")).display,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
    }));

    console.log(JSON.stringify({ resumeInfo, nestedReady, nestedRunning, gameInfo, errors }, null, 2));
    await browser.close();
})();
