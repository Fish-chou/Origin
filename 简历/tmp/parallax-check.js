const { chromium } = require("C:/Users/Fish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright");

(async () => {
    const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktop.goto("http://127.0.0.1:8000/", { waitUntil: "networkidle" });
    const before = await desktop.$eval("[data-parallax]", (element) => getComputedStyle(element).getPropertyValue("--parallax-y"));
    await desktop.evaluate(() => scrollTo(0, 1400));
    await desktop.waitForTimeout(80);
    const after = await desktop.$eval("[data-parallax]", (element) => getComputedStyle(element).getPropertyValue("--parallax-y"));
    const desktopFeatures = await desktop.evaluate(() => ({
        webpSources: [...document.images].map((image) => image.currentSrc).filter((source) => source.endsWith(".webp")).length,
        deferredScript: document.querySelector("script[src='js/main.js']")?.defer === true,
        criticalStyle: Boolean(document.querySelector("head > style"))
    }));

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mobile.goto("http://127.0.0.1:8000/", { waitUntil: "networkidle" });
    const mobileFeatures = await mobile.$eval("[data-parallax]", (element) => ({
        transform: getComputedStyle(element).transform,
        offset: getComputedStyle(element).getPropertyValue("--parallax-y")
    }));

    console.log(JSON.stringify({ before, after, desktopFeatures, mobileFeatures }, null, 2));
    await browser.close();
})();
