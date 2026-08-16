const fs = require("fs");
const vm = require("vm");

class FakeClassList {
    constructor() { this.values = new Set(); }
    add(value) { this.values.add(value); }
    remove(value) { this.values.delete(value); }
    toggle(value, force) {
        const next = force === undefined ? !this.values.has(value) : force;
        if (next) this.values.add(value); else this.values.delete(value);
        return next;
    }
    contains(value) { return this.values.has(value); }
}

class FakeElement {
    constructor(selector = "") {
        this.selector = selector;
        this.hidden = selector === "#pauseOverlay" || selector === "#resultOverlay";
        this.textContent = "";
        this.title = "";
        this.style = {};
        this.dataset = {};
        this.classList = new FakeClassList();
        this.listeners = {};
    }
    addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener); }
    setAttribute(name, value) { this[name] = String(value); }
    focus() {}
    setPointerCapture() {}
}

const context2d = new Proxy({}, {
    get(target, property) {
        if (!(property in target)) target[property] = () => {};
        return target[property];
    },
    set(target, property, value) { target[property] = value; return true; }
});

const elements = new Map();
function element(selector) {
    if (!elements.has(selector)) {
        const result = new FakeElement(selector);
        if (selector === "#gameCanvas") {
            result.width = 960;
            result.height = 600;
            result.getContext = () => context2d;
        }
        elements.set(selector, result);
    }
    return elements.get(selector);
}

const difficulty = [new FakeElement(), new FakeElement()];
difficulty[0].dataset.difficulty = "normal";
difficulty[1].dataset.difficulty = "hard";
const controls = ["up", "right", "down", "left", "fire"].map((control) => {
    const button = new FakeElement();
    button.dataset.control = control;
    return button;
});

const document = {
    hidden: false,
    fullscreenElement: null,
    querySelector: element,
    querySelectorAll(selector) {
        if (selector === "[data-difficulty]") return difficulty;
        if (selector === "[data-control]") return controls;
        return [];
    },
    addEventListener() {},
    exitFullscreen() { return Promise.resolve(); }
};
const localStorage = { getItem() { return null; }, setItem() {} };
const windowObject = { addEventListener() {}, localStorage };

const sandbox = {
    console,
    document,
    window: windowObject,
    localStorage,
    performance,
    requestAnimationFrame() {},
    Math,
    Number,
    String,
    Set,
    Promise
};
windowObject.window = windowObject;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("tank-battle/js/game.js", "utf8"), sandbox, { filename: "game.js" });

const game = windowObject.__tankGame;
const checks = {};
checks.ready = game.state === "ready";
checks.initialMap = game.obstacles.length >= 70;
checks.identityBricks = game.obstacles.filter((wall) => wall.type === "brick" && wall.x >= 300 && wall.x <= 660 && wall.y >= 200 && wall.y <= 310).length >= 35;

game.start();
checks.started = game.state === "running";
const initialY = game.player.y;
game.input.add("up");
game.update(.2);
game.input.delete("up");
checks.playerMovement = game.player.y < initialY;

game.player.shootTimer = 0;
const bulletCount = game.bullets.length;
game.shootPlayer();
checks.playerShooting = game.bullets.length === bulletCount + 1;

game.enemies = [{ x: 300, y: 300, w: 32, h: 38, hp: 1, heavy: false, direction: "down", speed: 0, turnTimer: 1, shootTimer: 1, spawnGrace: 1 }];
game.bullets = [{ x: 316, y: 319, vx: 0, vy: 0, r: 4, owner: "player" }];
const kills = game.kills;
game.updateBullets(0);
checks.enemyCollision = game.kills === kills + 1 && game.enemies.length === 0;

game.pause();
checks.pause = game.state === "paused";
game.resume();
checks.resume = game.state === "running";

game.base.safe = true;
game.bullets = [{ x: game.base.x + 35, y: game.base.y + 25, vx: 0, vy: 0, r: 4, owner: "enemy" }];
game.updateBullets(0);
checks.baseDefeat = game.state === "lost" && !game.base.safe;

const passed = Object.values(checks).every(Boolean);
console.log(JSON.stringify({ passed, checks, obstacleCount: game.obstacles.length }, null, 2));
if (!passed) process.exitCode = 1;
