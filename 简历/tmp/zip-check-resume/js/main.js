/* ============================================================
   简历数据与页面交互
   数据集中在 resume 对象中，DOM 全部使用原生 JavaScript 生成。
   ============================================================ */

const resume = {
    profile: {
        name: "赵梓晨",
        englishName: "ZHAO ZICHEN",
        role: "华南理工大学 · 电子科学与技术 · AI 应用实践",
        summary: "电子科学与技术专业在读，持续探索 AI 工具在编程、图像、音视频、文案和音乐创作中的实际应用。拥有人工智能训练师初级、高级双级认证，也在用工程方法把创意做成能运行、能体验的作品。",
        lead: "我关注的不只是工具本身，更重视如何把想法拆成清晰的任务、完成可运行的作品，并通过测试和反馈持续打磨。电子工程训练提供技术底座，钢琴、声乐与爵士鼓经历则塑造了我对节奏、表达和协作的理解。",
        school: "华南理工大学",
        major: "电子科学与技术",
        location: "广州",
        email: "q13434588837[at]163[dot]com",
        github: "https://github.com/Fish-chou"
    },
    highlights: [
        { value: "2 项", label: "人工智能训练师初级、高级认证" },
        { value: "2 个", label: "本次独立完成并交付的实践作品" },
        { value: "3 项", label: "钢琴、声乐、爵士鼓音乐特长" }
    ],
    education: [
        {
            time: "2025.09 - 2029.06",
            school: "华南理工大学",
            major: "电子科学与技术 · 本科在读",
            desc: "以电子技术与工程基础为主线，同时将 AI 工具应用于学习、编程和创作工作流。"
        }
    ],
    interests: [
        { title: "AI 应用探索", desc: "关注生成式 AI 在代码、视觉、音视频、知识整理与创作中的落地方法。" },
        { title: "音乐表达", desc: "钢琴、声乐与爵士鼓，长期训练带来节奏感、舞台表达与专注力。" },
        { title: "跨学科创作", desc: "喜欢把工程逻辑、交互设计和内容表达组合成完整作品。" }
    ],
    experience: [
        {
            time: "2026.08",
            title: "竞赛训练营作品开发",
            type: "个人项目实践",
            points: [
                "围绕筛选赛题完成响应式个人简历与坦克大战，从需求核对、信息架构到交互验收形成完整交付。",
                "简历使用原生 HTML、CSS、JavaScript 构建，覆盖主题切换、项目筛选、证书大图、打印 PDF 与移动端适配。",
                "游戏实现玩家移动与射击、敌方 AI、碰撞检测、胜负判定、触控操作及姓名缩写地图。"
            ]
        },
        {
            time: "2026.08",
            title: "人工智能训练师认证学习",
            type: "专业能力训练",
            points: [
                "完成阿里巴巴“橙点同学”人工智能训练师初级与高级认证。",
                "将所学方法延伸到编程辅助、图像生成、音视频创作、文案整理和音乐创作等实际场景。"
            ]
        }
    ],
    projects: [
        {
            title: "浪尖儿社区保卫战 · 坦克大战",
            category: "游戏",
            stack: "HTML5 Canvas / JavaScript",
            year: "2026",
            desc: "原创校园主题坦克游戏。玩家需要守护基地，在两波敌军中移动、瞄准与射击；支持键盘、触控、难度选择、暂停和音效。",
            result: "实现敌方 AI、可摧毁砖墙、钢墙、碰撞与胜负循环，并以 ZZC 砖墙布局强化地图识别。",
            link: "tank-battle/index.html",
            linkText: "开始游戏",
            image: "assets/tank-preview.png",
            imageAlt: "浪尖儿社区保卫战坦克大战游戏画面",
            monogram: "ZZC"
        },
        {
            title: "个人在线简历",
            category: "Web",
            stack: "HTML / CSS / JavaScript",
            year: "2026",
            desc: "面向竞赛评审与快速阅读场景设计的个人网站，集中呈现身份、教育、技能、项目、认证和联系方式。",
            result: "原生无框架、无外部资源依赖；完成响应式布局、深浅主题、滚动动效、筛选、打印和无障碍支持。",
            link: "#top",
            linkText: "返回首页",
            image: "",
            monogram: "WEB"
        }
    ],
    skills: [
        {
            title: "AI 应用",
            desc: "从提示设计到结果校验，覆盖学习、开发与内容创作的多场景工作流。",
            items: ["AI 辅助编程", "图像生成", "音视频创作", "知识整理", "AI 音乐"]
        },
        {
            title: "编程开发",
            desc: "能够完成网页与小型交互作品，并使用版本管理维护项目。",
            items: ["HTML", "CSS", "JavaScript", "Python", "Git"]
        },
        {
            title: "工程学习",
            desc: "以电子科学与技术专业学习为基础，重视逻辑拆解、实验验证与问题复盘。",
            items: ["电子技术", "工程思维", "需求拆解", "测试验收"]
        },
        {
            title: "音乐特长",
            desc: "技术之外的长期训练，形成对节奏、听觉、舞台和协作的敏感度。",
            items: ["钢琴", "声乐", "爵士鼓", "音乐创作"]
        }
    ],
    awards: [
        {
            name: "阿里巴巴“橙点同学”人工智能训练师（初级）认证",
            time: "2026.08",
            image: "assets/cert-junior.jpg"
        },
        {
            name: "阿里巴巴“橙点同学”人工智能训练师（高级）认证",
            time: "2026.08",
            image: "assets/cert-senior.jpg"
        }
    ]
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function webpPath(source) {
    return source.replace(/\.(?:jpe?g|png)$/i, ".webp");
}

function createResponsiveImage(source, alt, loading = "eager") {
    const picture = document.createElement("picture");
    const webp = createElement("source");
    webp.type = "image/webp";
    webp.srcset = webpPath(source);
    picture.appendChild(webp);

    const image = createElement("img");
    image.src = source;
    image.alt = alt;
    image.loading = loading;
    image.decoding = "async";
    picture.appendChild(image);
    return { picture, image };
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function getEmail() {
    return resume.profile.email.replace("[at]", "@").replace("[dot]", ".");
}

function renderHero() {
    $("#heroRole").textContent = resume.profile.role;
    $("#heroSummary").textContent = resume.profile.summary;

    const meta = $("#heroMeta");
    [resume.profile.school, resume.profile.major, resume.profile.location].forEach((item) => {
        meta.appendChild(createElement("li", "", item));
    });

    const highlights = $("#highlightsGrid");
    resume.highlights.forEach((item) => {
        const article = createElement("article", "impact-item");
        article.appendChild(createElement("strong", "impact-item__value", item.value));
        article.appendChild(createElement("p", "impact-item__label", item.label));
        highlights.appendChild(article);
    });
}

function renderProfile() {
    $("#profileLead").textContent = resume.profile.lead;

    const educationList = $("#educationList");
    resume.education.forEach((item) => {
        const article = createElement("article", "education-item");
        article.appendChild(createElement("time", "education-item__time", item.time));
        const body = createElement("div");
        body.appendChild(createElement("h3", "", item.school));
        body.appendChild(createElement("p", "education-item__major", item.major));
        body.appendChild(createElement("p", "education-item__desc", item.desc));
        article.appendChild(body);
        educationList.appendChild(article);
    });

    const interestList = $("#interestList");
    resume.interests.forEach((item, index) => {
        const article = createElement("article", "interest-item");
        article.appendChild(createElement("span", "interest-item__num", String(index + 1).padStart(2, "0")));
        const body = createElement("div");
        body.appendChild(createElement("h3", "", item.title));
        body.appendChild(createElement("p", "", item.desc));
        article.appendChild(body);
        interestList.appendChild(article);
    });
}

function renderExperience() {
    const list = $("#experienceList");
    resume.experience.forEach((item) => {
        const article = createElement("article", "experience-item reveal");
        article.appendChild(createElement("time", "experience-item__time", item.time));

        const heading = createElement("div");
        heading.appendChild(createElement("h3", "", item.title));
        heading.appendChild(createElement("p", "experience-item__type", item.type));
        article.appendChild(heading);

        const points = createElement("ul");
        item.points.forEach((point) => points.appendChild(createElement("li", "", point)));
        article.appendChild(points);
        list.appendChild(article);
    });
}

function renderProjects() {
    const categories = ["全部", ...new Set(resume.projects.map((project) => project.category))];
    const tabs = $("#projectTabs");

    categories.forEach((category, index) => {
        const button = createElement("button", "tab-button", category);
        button.type = "button";
        button.id = `project-tab-${index}`;
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", index === 0 ? "true" : "false");
        button.setAttribute("aria-controls", "projectGrid");
        button.tabIndex = index === 0 ? 0 : -1;
        button.dataset.category = category;
        tabs.appendChild(button);
    });

    const grid = $("#projectGrid");
    resume.projects.forEach((project) => {
        const article = createElement("article", "project-card reveal");
        article.dataset.category = project.category;

        const visual = createElement("div", "project-card__visual");
        if (project.image) {
            const responsiveImage = createResponsiveImage(project.image, project.imageAlt || `${project.title}项目预览`);
            const image = responsiveImage.image;
            image.addEventListener("error", () => {
                visual.replaceChildren(createElement("span", "", project.monogram || "PROJECT"));
                visual.classList.add("project-card__visual--generated");
            }, { once: true });
            visual.appendChild(responsiveImage.picture);
        } else {
            visual.classList.add("project-card__visual--generated");
            visual.appendChild(createElement("span", "", project.monogram || "PROJECT"));
        }
        article.appendChild(visual);

        const body = createElement("div", "project-card__body");
        const meta = createElement("p", "project-card__meta");
        meta.appendChild(createElement("span", "", project.stack));
        meta.appendChild(createElement("span", "", project.year));
        body.appendChild(meta);
        body.appendChild(createElement("h3", "", project.title));
        body.appendChild(createElement("p", "project-card__desc", project.desc));
        body.appendChild(createElement("p", "project-card__result", project.result));

        const actions = createElement("div", "project-card__actions");
        const link = createElement("a", "project-card__link", `${project.linkText} →`);
        link.href = project.link;
        if (!project.link.startsWith("#")) {
            link.target = "_blank";
            link.rel = "noopener";
        }
        actions.appendChild(link);
        body.appendChild(actions);
        article.appendChild(body);
        grid.appendChild(article);
    });
}

function renderSkills() {
    const grid = $("#skillsGrid");
    resume.skills.forEach((skill, index) => {
        const article = createElement("article", "skill-card reveal");
        article.appendChild(createElement("span", "skill-card__index", String(index + 1).padStart(2, "0")));
        article.appendChild(createElement("h3", "", skill.title));
        article.appendChild(createElement("p", "", skill.desc));
        const list = createElement("ul");
        skill.items.forEach((item) => list.appendChild(createElement("li", "", item)));
        article.appendChild(list);
        grid.appendChild(article);
    });
}

function renderAwards() {
    const grid = $("#awardsGrid");
    resume.awards.forEach((award) => {
        const article = createElement("article", "award-card reveal");
        const button = createElement("button");
        button.type = "button";
        button.dataset.lightboxImage = award.image;
        button.dataset.lightboxTitle = award.name;
        button.setAttribute("aria-label", `查看证书大图：${award.name}`);
        const responsiveImage = createResponsiveImage(award.image, award.name);
        button.appendChild(responsiveImage.picture);
        article.appendChild(button);

        const caption = createElement("div", "award-card__caption");
        caption.appendChild(createElement("h3", "", award.name));
        caption.appendChild(createElement("time", "", award.time));
        article.appendChild(caption);
        grid.appendChild(article);
    });
}

function renderContact() {
    const items = [
        { label: "邮箱", value: getEmail(), action: "copy" },
        { label: "GitHub", value: "Fish-chou", href: resume.profile.github },
        { label: "所在城市", value: resume.profile.location }
    ];
    const list = $("#contactList");

    items.forEach((item) => {
        const row = createElement("div", "contact-item");
        row.appendChild(createElement("span", "contact-item__label", item.label));
        row.appendChild(createElement("span", "contact-item__value", item.value));
        if (item.action === "copy") {
            const button = createElement("button", "", "复制邮箱");
            button.type = "button";
            button.addEventListener("click", copyEmail);
            row.appendChild(button);
        } else if (item.href) {
            const link = createElement("a", "", "打开主页");
            link.href = item.href;
            link.target = "_blank";
            link.rel = "noopener";
            row.appendChild(link);
        }
        list.appendChild(row);
    });
}

async function copyEmail() {
    const email = getEmail();
    try {
        await navigator.clipboard.writeText(email);
    } catch (error) {
        const input = createElement("textarea");
        input.value = email;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
    }
    showToast("邮箱已复制");
}

let toastTimer;
function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function bindProjectTabs() {
    const tabs = $$(".tab-button", $("#projectTabs"));
    const cards = $$(".project-card", $("#projectGrid"));

    function selectTab(selected) {
        tabs.forEach((tab) => {
            const active = tab === selected;
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });
        cards.forEach((card) => {
            card.hidden = selected.dataset.category !== "全部" && card.dataset.category !== selected.dataset.category;
        });
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => selectTab(tab));
        tab.addEventListener("keydown", (event) => {
            let nextIndex = index;
            if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
            if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End") nextIndex = tabs.length - 1;
            if (nextIndex !== index) {
                event.preventDefault();
                selectTab(tabs[nextIndex]);
                tabs[nextIndex].focus();
            }
        });
    });
}

function bindNavigation() {
    const toggle = $("#navToggle");
    const nav = $("#siteNav");

    function closeMenu() {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "打开导航");
        document.body.classList.remove("menu-open");
    }

    toggle.addEventListener("click", () => {
        const open = !nav.classList.contains("open");
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
        document.body.classList.toggle("menu-open", open);
    });
    $$("a", nav).forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => {
        if (window.innerWidth > 960) closeMenu();
    });

    const navLinks = $$("a[href^='#']", nav);
    const observedSections = navLinks.map((link) => $(link.getAttribute("href"))).filter(Boolean);
    const sectionObserver = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
    }, { rootMargin: "-25% 0px -60%", threshold: [0, .15, .4] });
    observedSections.forEach((section) => sectionObserver.observe(section));
}

function bindTheme() {
    let savedTheme = null;
    try { savedTheme = localStorage.getItem("resume-theme"); } catch (error) { /* file preview can restrict storage */ }
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyTheme(savedTheme || preferred);

    $("#themeToggle").addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem("resume-theme", next); } catch (error) { /* no persistent storage */ }
    });
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const dark = theme === "dark";
    $("#themeToggle").setAttribute("aria-label", dark ? "切换到浅色模式" : "切换到深色模式");
    $("meta[name='theme-color']").setAttribute("content", dark ? "#111614" : "#f4f7f5");
}

function bindLightbox() {
    const lightbox = $("#lightbox");
    const image = $("#lightboxImage");
    const title = $("#lightboxTitle");
    const closeButton = $("#lightboxClose");
    let returnFocus = null;

    function open(button) {
        returnFocus = button;
        image.src = button.dataset.lightboxImage;
        image.alt = button.dataset.lightboxTitle;
        title.textContent = button.dataset.lightboxTitle;
        lightbox.hidden = false;
        document.body.classList.add("lightbox-open");
        closeButton.focus();
    }

    function close() {
        lightbox.hidden = true;
        image.src = "";
        document.body.classList.remove("lightbox-open");
        if (returnFocus) returnFocus.focus();
    }

    $$('[data-lightbox-image]').forEach((button) => button.addEventListener("click", () => open(button)));
    closeButton.addEventListener("click", close);
    lightbox.addEventListener("click", (event) => { if (event.target === lightbox) close(); });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !lightbox.hidden) close();
    });
}

function bindPageUtilities() {
    $("#printBtn").addEventListener("click", () => window.print());
    const backTop = $("#backTop");
    const progress = $("#readingProgress");

    function updateScrollState() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const percentage = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
        progress.style.width = `${percentage}%`;
        backTop.classList.toggle("show", window.scrollY > 620);
    }

    window.addEventListener("scroll", updateScrollState, { passive: true });
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    updateScrollState();
}

function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        items.forEach((item) => item.classList.add("in"));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: .12 });
    items.forEach((item) => observer.observe(item));
}

function initParallax() {
    const items = $$("[data-parallax]");
    if (!items.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let enabled = window.innerWidth > 760 && !reducedMotion.matches;
    let frame = 0;

    const update = () => {
        frame = 0;
        items.forEach((item) => {
            if (!enabled) {
                item.style.setProperty("--parallax-y", "0px");
                return;
            }
            const rect = item.getBoundingClientRect();
            const speed = Number(item.dataset.parallaxSpeed) || 0.08;
            const max = Number(item.dataset.parallaxMax) || 28;
            const distance = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
            const offset = Math.max(-max, Math.min(max, -distance * speed * 100));
            item.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
        });
    };

    const requestUpdate = () => {
        if (!frame) frame = window.requestAnimationFrame(update);
    };
    const updateMode = () => {
        enabled = window.innerWidth > 760 && !reducedMotion.matches;
        requestUpdate();
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", updateMode, { passive: true });
    reducedMotion.addEventListener?.("change", updateMode);
    update();
}

function renderFooter() {
    const now = new Date();
    $("#footerYear").textContent = String(now.getFullYear());
    $("#footerDate").textContent = new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(now);
}

document.addEventListener("DOMContentLoaded", () => {
    renderHero();
    renderProfile();
    renderExperience();
    renderProjects();
    renderSkills();
    renderAwards();
    renderContact();
    renderFooter();

    bindProjectTabs();
    bindNavigation();
    bindTheme();
    bindLightbox();
    bindPageUtilities();
    initReveal();
    initParallax();
});
