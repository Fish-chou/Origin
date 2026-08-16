const fs = require("fs");
const path = require("path");
const { chromium } = require("C:/Users/Fish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright");

(async () => {
    const files = process.argv.slice(2);
    const browser = await chromium.launch({
        headless: true,
        executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
    });
    const page = await browser.newPage();

    for (const filename of files) {
        const absolute = path.resolve(filename);
        const extension = path.extname(absolute).toLowerCase();
        const mime = extension === ".png" ? "image/png" : "image/jpeg";
        const source = `data:${mime};base64,${fs.readFileSync(absolute).toString("base64")}`;
        const encoded = await page.evaluate((dataUrl) => new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                canvas.getContext("2d").drawImage(image, 0, 0);
                resolve(canvas.toDataURL("image/webp", .84).split(",")[1]);
            };
            image.onerror = () => reject(new Error("Unable to decode image"));
            image.src = dataUrl;
        }), source);
        const destination = absolute.replace(/\.(?:png|jpe?g)$/i, ".webp");
        fs.writeFileSync(destination, Buffer.from(encoded, "base64"));
        console.log(`${filename} -> ${destination}`);
    }

    await browser.close();
})();
