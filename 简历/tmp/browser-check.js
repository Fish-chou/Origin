const { chromium } = require("C:/Users/Fish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright");
const fs = require("fs");

(async () => {
    fs.mkdirSync("tmp/screenshots", { recursive: true });
    const browser = await chromium.launch({
        headless: true,
        executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
    });
    const report = { errors: [], checks: {} };

    async function attachDiagnostics(page, label) {
        page.on("console", (message) => {
            if (message.type() === "error") report.errors.push(`${label} console: ${message.text()}`);
        });
        page.on("pageerror", (error) => report.errors.push(`${label} page: ${error.message}`));
    }

    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
    await attachDiagnostics(desktop, "resume-desktop");
    await desktop.goto("http://127.0.0.1:8000/", { waitUntil: "networkidle" });
    report.checks.resumeDesktop = await desktop.evaluate(() => ({
        title: document.title,
        name: document.querySelector("h1")?.innerText,
        projects: document.querySelectorAll(".project-card").length,
        awards: document.querySelectorAll(".award-card").length,
        imagesLoaded: [...document.querySelectorAll(".award-card img, .project-card__visual img")].every((image) => image.complete && image.naturalWidth > 0),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        heroBottom: Math.round(document.querySelector(".hero").getBoundingClientRect().bottom),
        viewportHeight: window.innerHeight
    }));
    await desktop.screenshot({ path: "tmp/screenshots/resume-desktop.png", fullPage: true });
    await desktop.click("#themeToggle");
    report.checks.theme = await desktop.getAttribute("html", "data-theme");
    await desktop.click("#projectTabs [data-category='游戏']");
    report.checks.visibleGameProjects = await desktop.locator(".project-card:not([hidden])").count();
    await desktop.click(".award-card button");
    report.checks.lightboxOpen = await desktop.locator("#lightbox").isVisible();
    await desktop.click("#lightboxClose");

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: "light", isMobile: true, hasTouch: true });
    await attachDiagnostics(mobile, "resume-mobile");
    await mobile.goto("http://127.0.0.1:8000/", { waitUntil: "networkidle" });
    report.checks.resumeMobile = await mobile.evaluate(() => ({
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        heroBottom: Math.round(document.querySelector(".hero").getBoundingClientRect().bottom),
        impactTop: Math.round(document.querySelector(".impact").getBoundingClientRect().top),
        viewportHeight: window.innerHeight,
        menuButtonVisible: getComputedStyle(document.querySelector("#navToggle")).display !== "none"
    }));
    await mobile.screenshot({ path: "tmp/screenshots/resume-mobile.png", fullPage: true });

    const game = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await attachDiagnostics(game, "game-desktop");
    await game.goto("http://127.0.0.1:8000/tank-battle/", { waitUntil: "networkidle" });
    report.checks.gameReady = await game.evaluate(() => {
        const canvas = document.querySelector("#gameCanvas");
        const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
        let nonBlank = 0;
        for (let index = 3; index < data.length; index += 1600) if (data[index] !== 0) nonBlank += 1;
        return {
        state: window.__tankGame.state,
        walls: window.__tankGame.obstacles.length,
        railState: document.querySelector("#railState")?.textContent,
            nonBlankSamples: nonBlank,
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
    });
    await game.screenshot({ path: "tmp/screenshots/game-ready.png", fullPage: true });
    await game.click("#startButton");
    await game.waitForTimeout(1700);
    const startY = await game.evaluate(() => window.__tankGame.player.y);
    await game.keyboard.down("ArrowUp");
    await game.waitForTimeout(350);
    await game.keyboard.up("ArrowUp");
    await game.keyboard.press("Space");
    await game.waitForTimeout(250);
    report.checks.gameRunning = await game.evaluate((initialY) => ({
        state: window.__tankGame.state,
        railState: document.querySelector("#railState")?.textContent,
        enemiesSpawned: window.__tankGame.spawnedEnemies,
        playerMoved: window.__tankGame.player.y < initialY,
        playerLives: window.__tankGame.player.lives,
        bulletsPresent: window.__tankGame.bullets.length > 0
    }), startY);
    await game.click("#pauseButton");
    report.checks.pauseState = await game.evaluate(() => window.__tankGame.state);
    await game.click("#resumeButton");
    report.checks.resumeState = await game.evaluate(() => window.__tankGame.state);
    await game.screenshot({ path: "tmp/screenshots/game-running.png", fullPage: true });

    const gameMobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await attachDiagnostics(gameMobile, "game-mobile");
    await gameMobile.goto("http://127.0.0.1:8000/tank-battle/", { waitUntil: "networkidle" });
    report.checks.gameMobile = await gameMobile.evaluate(() => ({
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        touchControls: getComputedStyle(document.querySelector(".touch-controls")).display,
        stageWidth: Math.round(document.querySelector(".game-stage").getBoundingClientRect().width),
        stageHeight: Math.round(document.querySelector(".game-stage").getBoundingClientRect().height),
        startButtonVisible: document.querySelector("#startButton").getBoundingClientRect().bottom <= document.querySelector(".game-stage").getBoundingClientRect().bottom
    }));
    await gameMobile.screenshot({ path: "tmp/screenshots/game-mobile.png", fullPage: true });

    await browser.close();
    console.log(JSON.stringify(report, null, 2));
})();
