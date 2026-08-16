/* ============================================================
   浪尖儿社区保卫战 - 原生 Canvas 坦克大战
   作者：赵梓晨
   包含：移动、射击、敌方 AI、障碍碰撞、基地防守、两波敌军、
         胜负判定、难度切换、键盘与触屏控制、合成音效。
   ============================================================ */

const WORLD = { width: 960, height: 600 };
const DIRECTIONS = {
    up: { x: 0, y: -1, angle: 0 },
    right: { x: 1, y: 0, angle: Math.PI / 2 },
    down: { x: 0, y: 1, angle: Math.PI },
    left: { x: -1, y: 0, angle: -Math.PI / 2 }
};

class TankGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.state = "ready";
        this.difficulty = "normal";
        this.input = new Set();
        this.lastFrame = performance.now();
        this.elapsed = 0;
        this.muted = false;
        this.audioContext = null;
        this.highScore = this.readHighScore();
        this.waveNotice = 0;

        this.bindInterface();
        this.prepareWorld();
        requestAnimationFrame((time) => this.loop(time));
    }

    prepareWorld() {
        const hard = this.difficulty === "hard";
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.totalEnemies = hard ? 16 : 12;
        this.spawnedEnemies = 0;
        this.spawnTimer = .45;
        this.player = {
            x: 464,
            y: 478,
            w: 32,
            h: 38,
            direction: "up",
            speed: hard ? 184 : 196,
            lives: 3,
            shootTimer: 0,
            invulnerable: 0
        };
        this.base = { x: 444, y: 548, w: 72, h: 43, safe: true };
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.powerUps = [];
        this.obstacles = this.createMap();
        this.updateHud();
        this.draw();
    }

    createMap() {
        const obstacles = [];
        const add = (x, y, type = "brick", w = 18, h = 18, identity = false) => {
            obstacles.push({ x, y, w, h, type, identity, hp: type === "brick" ? 1 : Infinity });
        };

        // Central brick layout spells the author's initials: ZZC.
        const patterns = {
            Z: ["11111", "00010", "00100", "01000", "11111"],
            C: ["11111", "10000", "10000", "10000", "11111"]
        };
        const letters = ["Z", "Z", "C"];
        const tile = 18;
        const gap = 36;
        const startX = 309;
        const startY = 210;
        letters.forEach((letter, letterIndex) => {
            patterns[letter].forEach((row, rowIndex) => {
                [...row].forEach((cell, columnIndex) => {
                    if (cell === "1") {
                        add(startX + letterIndex * (tile * 5 + gap) + columnIndex * tile, startY + rowIndex * tile, "brick", tile, tile, true);
                    }
                });
            });
        });

        // Steel landmarks and side cover create navigable lanes around the initials.
        [
            [72, 154, 90, 18], [798, 154, 90, 18],
            [72, 410, 90, 18], [798, 410, 90, 18],
            [196, 108, 18, 72], [746, 108, 18, 72],
            [196, 384, 18, 72], [746, 384, 18, 72]
        ].forEach(([x, y, w, h]) => add(x, y, "steel", w, h));

        // Brick cover surrounding the campus base.
        for (let x = 408; x <= 534; x += 18) add(x, 522);
        add(408, 540);
        add(534, 540);

        // Extra cover keeps the upper battlefield varied without blocking spawns.
        [[270, 120], [288, 120], [654, 120], [672, 120], [252, 138], [690, 138],
         [110, 280], [128, 280], [814, 280], [832, 280], [110, 298], [832, 298],
         [270, 414], [288, 414], [654, 414], [672, 414]].forEach(([x, y]) => add(x, y));

        return obstacles;
    }

    bindInterface() {
        this.elements = {
            score: document.querySelector("#scoreValue"),
            wave: document.querySelector("#waveValue"),
            enemies: document.querySelector("#enemyValue"),
            lives: document.querySelector("#livesValue"),
            base: document.querySelector("#baseValue"),
            startOverlay: document.querySelector("#startOverlay"),
            pauseOverlay: document.querySelector("#pauseOverlay"),
            resultOverlay: document.querySelector("#resultOverlay"),
            resultEyebrow: document.querySelector("#resultEyebrow"),
            resultTitle: document.querySelector("#resultTitle"),
            resultMessage: document.querySelector("#resultMessage"),
            resultScore: document.querySelector("#resultScore"),
            announcer: document.querySelector("#gameAnnouncer"),
            pauseButton: document.querySelector("#pauseButton"),
            muteButton: document.querySelector("#muteButton"),
            railStatus: document.querySelector("#railStatusDot")?.parentElement,
            railState: document.querySelector("#railState"),
            railObjective: document.querySelector("#railObjective"),
            railWave: document.querySelector("#railWave")
        };

        document.querySelector("#startButton").addEventListener("click", () => this.start());
        document.querySelector("#restartButton").addEventListener("click", () => this.start());
        document.querySelector("#resumeButton").addEventListener("click", () => this.resume());
        this.elements.pauseButton.addEventListener("click", () => this.togglePause());
        this.elements.muteButton.addEventListener("click", () => this.toggleMute());
        document.querySelector("#fullscreenButton").addEventListener("click", () => this.toggleFullscreen());

        document.querySelectorAll("[data-difficulty]").forEach((button) => {
            button.addEventListener("click", () => {
                this.difficulty = button.dataset.difficulty;
                document.querySelectorAll("[data-difficulty]").forEach((item) => item.classList.toggle("active", item === button));
                this.prepareWorld();
            });
        });

        const keyMap = {
            ArrowUp: "up", KeyW: "up",
            ArrowRight: "right", KeyD: "right",
            ArrowDown: "down", KeyS: "down",
            ArrowLeft: "left", KeyA: "left"
        };
        window.addEventListener("keydown", (event) => {
            const control = keyMap[event.code];
            if (control) {
                event.preventDefault();
                this.input.add(control);
            }
            if (event.code === "Space" || event.code === "KeyJ") {
                event.preventDefault();
                this.input.add("fire");
                if (!event.repeat) this.shootPlayer();
            }
            if (!event.repeat && event.code === "KeyP") this.togglePause();
            if (!event.repeat && event.code === "KeyM") this.toggleMute();
            if (!event.repeat && event.code === "Enter" && ["ready", "won", "lost"].includes(this.state)) this.start();
        });
        window.addEventListener("keyup", (event) => {
            const control = keyMap[event.code];
            if (control) this.input.delete(control);
            if (event.code === "Space" || event.code === "KeyJ") this.input.delete("fire");
        });

        document.querySelectorAll("[data-control]").forEach((button) => {
            const control = button.dataset.control;
            const press = (event) => {
                event.preventDefault();
                button.classList.add("pressed");
                this.input.add(control);
                if (control === "fire") this.shootPlayer();
                try { button.setPointerCapture(event.pointerId); } catch (error) { /* pointer capture is optional */ }
            };
            const release = (event) => {
                event.preventDefault();
                button.classList.remove("pressed");
                this.input.delete(control);
            };
            button.addEventListener("pointerdown", press);
            button.addEventListener("pointerup", release);
            button.addEventListener("pointercancel", release);
            button.addEventListener("contextmenu", (event) => event.preventDefault());
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden && this.state === "running") this.pause();
        });
        window.addEventListener("blur", () => {
            if (this.state === "running") this.pause();
        });
    }

    start() {
        this.initAudio();
        this.state = "running";
        this.input.clear();
        this.prepareWorld();
        this.elements.startOverlay.hidden = true;
        this.elements.pauseOverlay.hidden = true;
        this.elements.resultOverlay.hidden = true;
        this.elements.pauseButton.classList.remove("is-paused");
        this.updateRail("LIVE DEFENSE", "DEFEND BASE");
        this.canvas.focus({ preventScroll: true });
        this.announce("作战开始");
        this.sound("start");
    }

    pause() {
        if (this.state !== "running") return;
        this.state = "paused";
        this.input.clear();
        this.elements.pauseOverlay.hidden = false;
        this.elements.pauseButton.classList.add("is-paused");
        this.elements.pauseButton.setAttribute("aria-label", "继续游戏");
        this.elements.pauseButton.title = "继续游戏";
        this.announce("游戏已暂停");
    }

    resume() {
        if (this.state !== "paused") return;
        this.state = "running";
        this.elements.pauseOverlay.hidden = true;
        this.elements.pauseButton.classList.remove("is-paused");
        this.elements.pauseButton.setAttribute("aria-label", "暂停游戏");
        this.elements.pauseButton.title = "暂停游戏";
        this.updateRail("PAUSED", "HOLD POSITION");
        this.lastFrame = performance.now();
        this.canvas.focus({ preventScroll: true });
        this.announce("继续作战");
        this.updateRail("LIVE DEFENSE", "DEFEND BASE");
    }

    togglePause() {
        if (this.state === "running") this.pause();
        else if (this.state === "paused") this.resume();
    }

    toggleMute() {
        this.muted = !this.muted;
        this.elements.muteButton.classList.toggle("is-muted", this.muted);
        this.elements.muteButton.setAttribute("aria-label", this.muted ? "开启音效" : "关闭音效");
        this.elements.muteButton.title = this.muted ? "开启音效" : "关闭音效";
        if (!this.muted) {
            this.initAudio();
            this.sound("menu");
        }
    }

    toggleFullscreen() {
        const stage = document.querySelector("#gameStage");
        if (!document.fullscreenElement) {
            stage.requestFullscreen?.().catch(() => {});
        } else {
            document.exitFullscreen?.().catch(() => {});
        }
    }

    initAudio() {
        if (this.audioContext) {
            if (this.audioContext.state === "suspended") this.audioContext.resume().catch(() => {});
            return;
        }
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        try { this.audioContext = new AudioContext(); } catch (error) { this.audioContext = null; }
    }

    sound(type) {
        if (this.muted || !this.audioContext) return;
        const presets = {
            shoot: [150, 82, .07, "square", .025],
            enemyShoot: [96, 70, .06, "sawtooth", .012],
            brick: [125, 55, .08, "square", .018],
            hit: [74, 35, .16, "sawtooth", .035],
            start: [260, 520, .18, "triangle", .035],
            wave: [330, 660, .28, "triangle", .035],
            win: [440, 880, .46, "sine", .04],
            lose: [180, 58, .55, "sawtooth", .035],
            menu: [360, 460, .08, "sine", .02],
            power: [520, 920, .22, "sine", .03]
        };
        const [from, to, duration, wave, volume] = presets[type] || presets.menu;
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        oscillator.type = wave;
        oscillator.frequency.setValueAtTime(from, now);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + duration);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
        oscillator.connect(gain).connect(this.audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    loop(time) {
        const dt = Math.min(.033, Math.max(0, (time - this.lastFrame) / 1000));
        this.lastFrame = time;
        if (this.state === "running") this.update(dt);
        this.draw();
        requestAnimationFrame((nextTime) => this.loop(nextTime));
    }

    update(dt) {
        this.elapsed += dt;
        this.player.shootTimer = Math.max(0, this.player.shootTimer - dt);
        this.player.invulnerable = Math.max(0, this.player.invulnerable - dt);
        this.waveNotice = Math.max(0, this.waveNotice - dt);

        this.updatePlayer(dt);
        this.updateEnemies(dt);
        this.updateBullets(dt);
        this.updateParticles(dt);
        this.updatePowerUps(dt);
        this.spawnEnemies(dt);

        if (this.input.has("fire")) this.shootPlayer();
        if (this.kills >= this.totalEnemies && this.enemies.length === 0 && this.spawnedEnemies >= this.totalEnemies) {
            this.finish(true);
        }
    }

    updatePlayer(dt) {
        const pressed = ["up", "right", "down", "left"].filter((direction) => this.input.has(direction));
        if (!pressed.length) return;

        const direction = pressed[pressed.length - 1];
        this.player.direction = direction;
        const vector = DIRECTIONS[direction];
        this.moveTank(this.player, vector.x * this.player.speed * dt, vector.y * this.player.speed * dt);
    }

    updateEnemies(dt) {
        this.enemies.forEach((enemy) => {
            enemy.turnTimer -= dt;
            enemy.shootTimer -= dt;
            enemy.spawnGrace = Math.max(0, enemy.spawnGrace - dt);

            if (enemy.turnTimer <= 0) this.chooseEnemyDirection(enemy);
            const vector = DIRECTIONS[enemy.direction];
            const moved = this.moveTank(enemy, vector.x * enemy.speed * dt, vector.y * enemy.speed * dt);
            if (!moved) {
                enemy.turnTimer = 0;
                this.chooseEnemyDirection(enemy, true);
            }

            if (enemy.shootTimer <= 0 && enemy.spawnGrace <= 0) {
                this.shootTank(enemy, "enemy");
                const baseDelay = this.difficulty === "hard" ? 1.05 : 1.45;
                enemy.shootTimer = baseDelay + Math.random() * 1.15;
            }
        });
    }

    chooseEnemyDirection(enemy, forced = false) {
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const chaseChance = this.difficulty === "hard" ? .68 : .48;
        let direction;

        if (Math.random() < chaseChance) {
            if (Math.abs(dx) > Math.abs(dy)) direction = dx > 0 ? "right" : "left";
            else direction = dy > 0 ? "down" : "up";
        } else {
            const choices = ["up", "right", "down", "left"].filter((item) => !forced || item !== enemy.direction);
            direction = choices[Math.floor(Math.random() * choices.length)];
        }
        enemy.direction = direction;
        enemy.turnTimer = .45 + Math.random() * (this.difficulty === "hard" ? .75 : 1.25);
    }

    moveTank(tank, dx, dy) {
        let moved = false;
        if (dx !== 0 && this.canOccupy(tank, tank.x + dx, tank.y)) {
            tank.x += dx;
            moved = true;
        }
        if (dy !== 0 && this.canOccupy(tank, tank.x, tank.y + dy)) {
            tank.y += dy;
            moved = true;
        }
        return moved;
    }

    canOccupy(tank, x, y) {
        const candidate = { x, y, w: tank.w, h: tank.h };
        if (x < 6 || y < 6 || x + tank.w > WORLD.width - 6 || y + tank.h > WORLD.height - 6) return false;
        if (this.obstacles.some((wall) => intersects(candidate, wall, 1))) return false;
        if (intersects(candidate, this.base, 1)) return false;

        const tanks = [this.player, ...this.enemies].filter((item) => item !== tank);
        if (tanks.some((other) => intersects(candidate, other, 2))) return false;
        return true;
    }

    shootPlayer() {
        if (this.state !== "running" || this.player.shootTimer > 0) return;
        this.shootTank(this.player, "player");
        this.player.shootTimer = .25;
        this.sound("shoot");
    }

    shootTank(tank, owner) {
        const direction = DIRECTIONS[tank.direction];
        const centerX = tank.x + tank.w / 2;
        const centerY = tank.y + tank.h / 2;
        const offset = Math.max(tank.w, tank.h) / 2 + 8;
        const speed = owner === "player" ? 520 : (this.difficulty === "hard" ? 360 : 315);
        this.bullets.push({
            x: centerX + direction.x * offset,
            y: centerY + direction.y * offset,
            vx: direction.x * speed,
            vy: direction.y * speed,
            r: owner === "player" ? 4 : 3.5,
            owner
        });
        if (owner === "enemy") this.sound("enemyShoot");
    }

    updateBullets(dt) {
        for (let index = this.bullets.length - 1; index >= 0; index -= 1) {
            const bullet = this.bullets[index];
            bullet.x += bullet.vx * dt;
            bullet.y += bullet.vy * dt;

            if (bullet.x < 0 || bullet.y < 0 || bullet.x > WORLD.width || bullet.y > WORLD.height) {
                this.bullets.splice(index, 1);
                continue;
            }

            const wallIndex = this.obstacles.findIndex((wall) => circleIntersectsRect(bullet, wall));
            if (wallIndex >= 0) {
                const wall = this.obstacles[wallIndex];
                if (wall.type === "brick") {
                    this.obstacles.splice(wallIndex, 1);
                    if (bullet.owner === "player") this.score += 5;
                    this.createBurst(bullet.x, bullet.y, "#bb6b47", 5);
                    this.sound("brick");
                } else {
                    this.createBurst(bullet.x, bullet.y, "#dce6e1", 3);
                }
                this.bullets.splice(index, 1);
                this.updateHud();
                continue;
            }

            if (bullet.owner === "enemy" && circleIntersectsRect(bullet, this.base)) {
                this.bullets.splice(index, 1);
                this.base.safe = false;
                this.createBurst(this.base.x + this.base.w / 2, this.base.y + this.base.h / 2, "#f06757", 24);
                this.finish(false, "base");
                continue;
            }

            if (bullet.owner === "player") {
                const enemyIndex = this.enemies.findIndex((enemy) => circleIntersectsRect(bullet, enemy));
                if (enemyIndex >= 0) {
                    const enemy = this.enemies[enemyIndex];
                    this.bullets.splice(index, 1);
                    enemy.hp -= 1;
                    this.createBurst(bullet.x, bullet.y, enemy.heavy ? "#f0cc61" : "#f06757", 10);
                    if (enemy.hp <= 0) this.destroyEnemy(enemyIndex);
                    else {
                        this.score += 35;
                        this.sound("hit");
                        this.updateHud();
                    }
                    continue;
                }
            } else if (this.player.invulnerable <= 0 && circleIntersectsRect(bullet, this.player)) {
                this.bullets.splice(index, 1);
                this.damagePlayer();
            }
        }

        // Opposing shells cancel each other on contact.
        for (let first = this.bullets.length - 1; first >= 0; first -= 1) {
            for (let second = first - 1; second >= 0; second -= 1) {
                const a = this.bullets[first];
                const b = this.bullets[second];
                if (!a || !b) continue;
                if (a.owner !== b.owner && Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r + 3) {
                    this.createBurst((a.x + b.x) / 2, (a.y + b.y) / 2, "#ffffff", 4);
                    this.bullets.splice(first, 1);
                    this.bullets.splice(second, 1);
                    break;
                }
            }
        }
    }

    destroyEnemy(index) {
        const enemy = this.enemies[index];
        this.enemies.splice(index, 1);
        this.kills += 1;
        this.score += enemy.heavy ? 180 : 110;
        this.createBurst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.heavy ? "#f0cc61" : "#f06757", 22);
        this.sound("hit");

        const half = Math.ceil(this.totalEnemies / 2);
        if (this.wave === 1 && this.kills >= half) {
            this.wave = 2;
            this.waveNotice = 2.2;
            this.spawnTimer = .2;
            this.powerUps.push({ x: 472, y: 382, w: 24, h: 24, life: 12 });
            this.sound("wave");
            this.announce("第二波敌军来袭，中央出现护盾补给");
        }
        this.updateHud();
    }

    damagePlayer() {
        this.player.lives -= 1;
        this.createBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, "#69d0a8", 20);
        this.sound("hit");
        if (this.player.lives <= 0) {
            this.finish(false, "tank");
        } else {
            this.player.x = 464;
            this.player.y = 478;
            this.player.direction = "up";
            this.player.invulnerable = 2.2;
            this.announce(`装甲受损，剩余 ${this.player.lives} 点`);
        }
        this.updateHud();
    }

    spawnEnemies(dt) {
        this.spawnTimer -= dt;
        const maxActive = this.difficulty === "hard" ? 5 : 4;
        if (this.spawnTimer > 0 || this.spawnedEnemies >= this.totalEnemies || this.enemies.length >= maxActive) return;

        const points = [{ x: 58, y: 28 }, { x: 464, y: 28 }, { x: 870, y: 28 }];
        const startIndex = this.spawnedEnemies % points.length;
        let point = null;
        for (let offset = 0; offset < points.length; offset += 1) {
            const candidate = points[(startIndex + offset) % points.length];
            const rect = { x: candidate.x, y: candidate.y, w: 32, h: 38 };
            if (![this.player, ...this.enemies].some((tank) => intersects(rect, tank, 18))) {
                point = candidate;
                break;
            }
        }
        if (!point) {
            this.spawnTimer = .35;
            return;
        }

        const heavy = (this.spawnedEnemies + 1) % 4 === 0 || (this.wave === 2 && Math.random() < .25);
        const scout = !heavy && (this.spawnedEnemies + 1) % 5 === 0;
        const kind = heavy ? "heavy" : (scout ? "scout" : "raider");
        const enemy = {
            x: point.x,
            y: point.y,
            w: 32,
            h: 38,
            direction: "down",
            speed: (this.difficulty === "hard" ? 118 : 94) * (heavy ? .86 : (scout ? 1.28 : 1)),
            hp: heavy ? 2 : 1,
            heavy,
            kind,
            turnTimer: .4 + Math.random(),
            shootTimer: .8 + Math.random(),
            spawnGrace: .55
        };
        this.enemies.push(enemy);
        this.spawnedEnemies += 1;
        this.spawnTimer = this.difficulty === "hard" ? .78 : 1.08;
        this.updateHud();
    }

    updatePowerUps(dt) {
        for (let index = this.powerUps.length - 1; index >= 0; index -= 1) {
            const powerUp = this.powerUps[index];
            powerUp.life -= dt;
            if (powerUp.life <= 0) {
                this.powerUps.splice(index, 1);
                continue;
            }
            if (intersects(this.player, powerUp)) {
                this.player.invulnerable = Math.max(this.player.invulnerable, 6);
                this.score += 80;
                this.powerUps.splice(index, 1);
                this.sound("power");
                this.announce("护盾已激活");
                this.updateHud();
            }
        }
    }

    updateParticles(dt) {
        for (let index = this.particles.length - 1; index >= 0; index -= 1) {
            const particle = this.particles[index];
            particle.life -= dt;
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vx *= .96;
            particle.vy *= .96;
            if (particle.life <= 0) this.particles.splice(index, 1);
        }
    }

    createBurst(x, y, color, count) {
        for (let index = 0; index < count; index += 1) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 35 + Math.random() * 130;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: .25 + Math.random() * .45,
                maxLife: .7,
                size: 2 + Math.random() * 4,
                color
            });
        }
    }

    finish(won, reason = "") {
        if (!["running", "paused"].includes(this.state)) return;
        this.state = won ? "won" : "lost";
        this.input.clear();
        this.elements.pauseOverlay.hidden = true;
        this.elements.resultOverlay.hidden = false;
        this.elements.resultEyebrow.textContent = won ? "MISSION COMPLETE" : "MISSION FAILED";
        this.elements.resultTitle.textContent = won ? "浪尖儿社区安全" : "防线失守";
        this.elements.resultMessage.textContent = won
            ? `两波敌军已全部击退，最高记录 ${Math.max(this.highScore, this.score).toString().padStart(4, "0")}。`
            : (reason === "base" ? "基地遭到命中，重新组织防线。" : "装甲耗尽，重新组织防线。");
        this.elements.resultScore.textContent = this.score.toString().padStart(4, "0");
        this.elements.pauseButton.classList.remove("is-paused");
        this.updateRail(won ? "MISSION CLEAR" : "DEFENSE BREACHED", won ? "SECTOR SECURE" : "REDEPLOY REQUIRED");
        this.saveHighScore();
        this.sound(won ? "win" : "lose");
        this.announce(won ? "任务完成，浪尖儿社区安全" : "任务失败，防线失守");
    }

    updateHud() {
        this.elements.score.textContent = this.score.toString().padStart(4, "0");
        this.elements.wave.textContent = `${this.wave} / 2`;
        this.elements.enemies.textContent = String(Math.max(0, this.totalEnemies - this.kills));
        this.elements.lives.textContent = String(this.player.lives);
        this.elements.base.textContent = this.base.safe ? "安全" : "失守";
        this.elements.base.style.color = this.base.safe ? "var(--mint)" : "var(--coral)";
        if (this.elements.railWave) this.elements.railWave.textContent = `${String(this.wave).padStart(2, "0")} / 02`;
    }

    updateRail(state, objective) {
        if (!this.elements.railState || !this.elements.railStatus) return;
        this.elements.railState.textContent = state;
        this.elements.railObjective.textContent = objective;
        this.elements.railStatus.classList.toggle("is-live", state === "LIVE DEFENSE");
        this.elements.railStatus.classList.toggle("is-failed", state === "DEFENSE BREACHED");
    }

    announce(message) {
        this.elements.announcer.textContent = message;
    }

    readHighScore() {
        try { return Number(localStorage.getItem("zzc-tank-high-score")) || 0; }
        catch (error) { return 0; }
    }

    saveHighScore() {
        if (this.score <= this.highScore) return;
        this.highScore = this.score;
        try { localStorage.setItem("zzc-tank-high-score", String(this.highScore)); }
        catch (error) { /* local file mode may not expose persistent storage */ }
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, WORLD.width, WORLD.height);
        this.drawAtmosphere(ctx);
        this.obstacles.forEach((wall) => this.drawWall(ctx, wall));
        this.drawBase(ctx);
        this.powerUps.forEach((powerUp) => this.drawPowerUp(ctx, powerUp));
        this.drawTank(ctx, this.player, "player");
        this.enemies.forEach((enemy) => this.drawTank(ctx, enemy, "enemy"));
        this.bullets.forEach((bullet) => this.drawBullet(ctx, bullet));
        this.particles.forEach((particle) => this.drawParticle(ctx, particle));
        if (this.waveNotice > 0) this.drawWaveNotice(ctx);
    }

    drawAtmosphere(ctx) {
        ctx.save();
        ctx.fillStyle = "rgba(3, 9, 6, .08)";
        for (let x = 0; x <= WORLD.width; x += 48) ctx.fillRect(x, 0, 1, WORLD.height);
        for (let y = 0; y <= WORLD.height; y += 48) ctx.fillRect(0, y, WORLD.width, 1);
        ctx.strokeStyle = "rgba(210, 236, 222, .22)";
        ctx.lineWidth = 2;
        ctx.strokeRect(7, 7, WORLD.width - 14, WORLD.height - 14);
        ctx.fillStyle = "rgba(240, 204, 97, .18)";
        ctx.font = "800 13px Segoe UI, sans-serif";
        ctx.fillText("LANGJIAN COMMUNITY DEFENSE", 24, 582);
        ctx.restore();
    }

    drawWall(ctx, wall) {
        ctx.save();
        if (wall.type === "brick") {
            ctx.fillStyle = wall.identity ? "#69e6be" : "#f0c95b";
            ctx.fillRect(wall.x + 1, wall.y + 1, wall.w - 2, wall.h - 2);
            ctx.fillStyle = wall.identity ? "#d9fff2" : "#fff0a3";
            ctx.fillRect(wall.x + 2, wall.y + 2, wall.w - 4, 3);
            ctx.strokeStyle = wall.identity ? "#f4fffb" : "#7b3b26";
            ctx.lineWidth = wall.identity ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(wall.x, wall.y + wall.h / 2);
            ctx.lineTo(wall.x + wall.w, wall.y + wall.h / 2);
            ctx.moveTo(wall.x + wall.w / 2, wall.y);
            ctx.lineTo(wall.x + wall.w / 2, wall.y + wall.h / 2);
            ctx.moveTo(wall.x + wall.w / 4, wall.y + wall.h / 2);
            ctx.lineTo(wall.x + wall.w / 4, wall.y + wall.h);
            ctx.stroke();
            if (wall.identity) {
                ctx.strokeStyle = "rgba(19, 71, 57, .88)";
                ctx.lineWidth = 1;
                ctx.strokeRect(wall.x + 1.5, wall.y + 1.5, wall.w - 3, wall.h - 3);
            }
        } else {
            ctx.fillStyle = "#a9dcd1";
            ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
            ctx.fillStyle = "#effff9";
            ctx.fillRect(wall.x + 3, wall.y + 3, wall.w - 6, 4);
            ctx.strokeStyle = "#31584e";
            ctx.strokeRect(wall.x + .5, wall.y + .5, wall.w - 1, wall.h - 1);
            for (let x = wall.x + 9; x < wall.x + wall.w; x += 18) {
                ctx.beginPath();
                ctx.moveTo(x, wall.y);
                ctx.lineTo(x, wall.y + wall.h);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    drawBase(ctx) {
        ctx.save();
        const { x, y, w, h } = this.base;
        ctx.fillStyle = this.base.safe ? "#e6d7a4" : "#67392e";
        ctx.fillRect(x, y + 10, w, h - 10);
        ctx.fillStyle = this.base.safe ? "#f0cc61" : "#f06757";
        ctx.beginPath();
        ctx.moveTo(x - 4, y + 12);
        ctx.lineTo(x + w / 2, y - 5);
        ctx.lineTo(x + w + 4, y + 12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#17342a";
        ctx.fillRect(x + 27, y + 23, 18, 20);
        ctx.fillStyle = "rgba(23, 52, 42, .72)";
        ctx.fillRect(x + 9, y + 21, 10, 9);
        ctx.fillRect(x + 53, y + 21, 10, 9);
        ctx.restore();
    }

    drawTank(ctx, tank, owner) {
        if (owner === "player" && tank.invulnerable > 0 && Math.floor(tank.invulnerable * 10) % 2 === 0) return;
        const centerX = tank.x + tank.w / 2;
        const centerY = tank.y + tank.h / 2;
        const angle = DIRECTIONS[tank.direction].angle;
        const bodyColor = owner === "player" ? "#69d0a8" : (tank.heavy ? "#f0cc61" : (tank.kind === "scout" ? "#60bdb9" : "#f06757"));
        const detailColor = owner === "player" ? "#d8fff0" : (tank.heavy ? "#fff2b2" : (tank.kind === "scout" ? "#d2ffff" : "#ffd1cb"));

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.fillStyle = "rgba(0,0,0,.32)";
        ctx.fillRect(-17, -17, 34, 40);
        ctx.fillStyle = "#1a201d";
        ctx.fillRect(-17, -18, 7, 36);
        ctx.fillRect(10, -18, 7, 36);
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-11, -16, 22, 32);
        ctx.fillStyle = detailColor;
        ctx.fillRect(-8, -12, 16, 6);
        ctx.fillStyle = "#202822";
        ctx.fillRect(-3, -26, 6, 21);
        ctx.beginPath();
        ctx.arc(0, 1, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(0, 1, 4, 0, Math.PI * 2);
        ctx.fill();
        if (tank.heavy) {
            ctx.strokeStyle = "#fff2b2";
            ctx.lineWidth = 2;
            ctx.strokeRect(-8, -13, 16, 26);
        } else if (tank.kind === "scout") {
            ctx.strokeStyle = "#d2ffff";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-7, -10, 14, 20);
        }
        ctx.restore();
    }

    drawBullet(ctx, bullet) {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = bullet.owner === "player" ? "#f0cc61" : "#f06757";
        ctx.fillStyle = bullet.owner === "player" ? "#fff2a8" : "#ff8a7d";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawPowerUp(ctx, powerUp) {
        const pulse = 1 + Math.sin(this.elapsed * 8) * .08;
        ctx.save();
        ctx.translate(powerUp.x + powerUp.w / 2, powerUp.y + powerUp.h / 2);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = "rgba(96, 189, 185, .22)";
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#82e4df";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -11);
        ctx.lineTo(9, -7);
        ctx.lineTo(7, 5);
        ctx.quadraticCurveTo(0, 13, -7, 5);
        ctx.lineTo(-9, -7);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    drawParticle(ctx, particle) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        ctx.restore();
    }

    drawWaveNotice(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.waveNotice);
        ctx.fillStyle = "rgba(7, 12, 9, .82)";
        ctx.fillRect(300, 270, 360, 64);
        ctx.fillStyle = "#f0cc61";
        ctx.textAlign = "center";
        ctx.font = "900 28px Segoe UI, Microsoft YaHei, sans-serif";
        ctx.fillText("第二波敌军来袭", WORLD.width / 2, 311);
        ctx.restore();
    }
}

function intersects(a, b, padding = 0) {
    return a.x + padding < b.x + b.w &&
        a.x + a.w - padding > b.x &&
        a.y + padding < b.y + b.h &&
        a.y + a.h - padding > b.y;
}

function circleIntersectsRect(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy <= circle.r * circle.r;
}

const game = new TankGame(document.querySelector("#gameCanvas"));

// Exposed for automated smoke tests and competition review diagnostics.
window.__tankGame = game;
