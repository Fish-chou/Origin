const { chromium } = require("C:/Users/Fish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright");

(async () => {
    const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("http://127.0.0.1:8000/tank-battle/", { waitUntil: "networkidle" });
    await page.click("#startButton");
    await page.evaluate(() => {
        const game = window.__tankGame;
        game.__frames = 0;
        const draw = game.draw.bind(game);
        game.draw = () => { game.__frames += 1; draw(); };
    });
    await page.keyboard.down("ArrowUp");
    await page.keyboard.down("Space");
    await page.waitForTimeout(30000);
    await page.keyboard.up("ArrowUp");
    await page.keyboard.up("Space");
    const result = await page.evaluate(() => {
        const game = window.__tankGame;
        return {
            state: game.state,
            frames: game.__frames,
            elapsed: game.elapsed,
            enemies: game.enemies.length,
            bullets: game.bullets.length,
            particles: game.particles.length,
            spawned: game.spawnedEnemies,
            kills: game.kills,
            player: { x: game.player.x, y: game.player.y, lives: game.player.lives }
        };
    });
    console.log(JSON.stringify({ result, errors }, null, 2));
    await browser.close();
})();
