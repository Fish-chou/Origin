const { chromium } = require("C:/Users/Fish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright");

(async () => {
    const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto("http://127.0.0.1:8000/tank-battle/", { waitUntil: "networkidle" });
    await page.click("#startButton");
    await page.waitForTimeout(350);
    await page.locator("#gameStage").screenshot({ path: "assets/tank-preview.png" });
    await browser.close();
})();
