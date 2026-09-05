const canvas = document.querySelector("#sequence");
const context = canvas.getContext("2d", { alpha: false });
const frameCount = 180;
const framePath = (frame) =>
  `ezgif-243d03533d6dd1f2-jpg/ezgif-frame-${String(frame).padStart(3, "0")}.jpg`;

const frames = new Array(frameCount);
const mobileLayoutQuery = matchMedia("(max-width: 760px)");
const mobileMotionQuery = matchMedia("(max-width: 760px), (pointer: coarse)");
const panels = [...document.querySelectorAll(".panel")];
const dynamicNav = document.querySelector(".dynamic-nav");
const navPill = document.querySelector(".dynamic-nav__pill");
const navToggle = document.querySelector(".dynamic-nav__eyes");
const navItems = [...document.querySelectorAll(".dynamic-nav a[data-panel]")];
const panelLinks = [...document.querySelectorAll("a[data-panel]")];
const pupils = [...document.querySelectorAll(".pupil")];
const orbitViewport = document.querySelector(".orbit-viewport");
const orbitTrack = document.querySelector(".orbit-track");
const metricsPanel = document.querySelector(".metrics-panel");
const metricCounters = metricsPanel
  ? [...metricsPanel.querySelectorAll(".metric-grid strong")].map((counter) => {
      const match = counter.textContent.trim().match(/^(\d+)(.*)$/);
      return { counter, value: Number(match?.[1] || 0), suffix: match?.[2] || "" };
    })
  : [];
let targetFrame = 0;
let displayFrame = 0;
let lastDrawnFrame = -1;
let ticking = false;
let metricsAreActive = false;
let metricsAnimationId = 0;

function setMetricValues(progress = 0) {
  metricCounters.forEach(({ counter, value, suffix }) => {
    counter.textContent = `${Math.round(value * progress)}${suffix}`;
  });
}

function animateMetricCounters() {
  const animationId = ++metricsAnimationId;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setMetricValues(1);
    return;
  }

  const startedAt = performance.now();
  const duration = 1100;
  const tick = (now) => {
    if (animationId !== metricsAnimationId || !metricsAreActive) return;
    const elapsed = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    setMetricValues(eased);
    if (elapsed < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function updateMetricCounters(isActive) {
  if (isActive === metricsAreActive) return;
  metricsAreActive = isActive;
  if (isActive) animateMetricCounters();
  else {
    metricsAnimationId += 1;
    setMetricValues(0);
  }
}

setMetricValues(0);

const skillConsole = document.querySelector(".skill-console");
if (skillConsole) {
  const skillData = [
    ["Programming", "Core languages used to build responsive products and data workflows.", ["Python", "SQL", "JavaScript", "Dart"]],
    ["Artificial Intelligence", "Models, vision systems, and modern AI tooling for intelligent applications.", ["Machine Learning", "Deep Learning", "Agentic AI", "Computer Vision", "Large Language Models", "YOLO", "OpenCV", "TensorFlow"]],
    ["Frameworks & Development", "Product frameworks and backend services for shipping complete solutions.", ["Flutter", "React", "FastAPI", "Node.js"]],
    ["Databases", "Flexible cloud and local data layers for dependable applications.", ["MongoDB", "Firebase", "SQLite"]],
    ["Data Analytics", "Tools for turning raw data into useful business and product insights.", ["Power BI", "Excel", "Pandas", "NumPy", "Matplotlib"]],
    ["Development Tools", "Daily tools for versioning, experimentation, and collaborative delivery.", ["Git", "GitHub", "Visual Studio Code", "Google Colab"]],
  ];
  const skillTabs = [...skillConsole.querySelectorAll("[role=tab]")];
  const skillDetail = skillConsole.querySelector(".skill-console__detail");
  function setSkillConsole(index) {
    const [title, description, tags] = skillData[index];
    skillTabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    skillDetail.innerHTML = `<p class="skill-console__eyebrow">ACTIVE STACK / ${String(index + 1).padStart(2, "0")}</p><h3>${title}</h3><p>${description}</p><div>${tags.map((tag) => `<span>${tag}</span>`).join("")}</div>`;
  }
  skillTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setSkillConsole(index));
    tab.addEventListener("keydown", (event) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? skillTabs.length - 1 : (index + (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) + skillTabs.length) % skillTabs.length;
      skillTabs[next].focus();
      setSkillConsole(next);
    });
  });
  skillConsole.querySelector(".skill-console__tabs").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-skill-index]");
    if (tab) setSkillConsole(Number(tab.dataset.skillIndex));
  });
  setSkillConsole(0);
}

function loadFrame(index) {
  if (frames[index]) return;
  const image = new Image();
  frames[index] = image;
  image.decoding = "async";
  image.src = framePath(index + 1);
  image.onload = () => {
    if (index === 0 || index === Math.round(displayFrame)) draw(index);
  };
}

function preloadFrames() {
  loadFrame(0);
  let index = 1;
  const loadBatch = () => {
    const end = Math.min(index + 12, frameCount);
    while (index < end) loadFrame(index++);
    if (index < frameCount) {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(loadBatch, { timeout: 150 });
      } else {
        setTimeout(loadBatch, 16);
      }
    }
  };
  loadBatch();
}

function resize() {
  // Keep mobile frame rendering crisp without paying the full desktop 2x canvas cost.
  const ratioCap = mobileMotionQuery.matches ? 1.35 : 2;
  const ratio = Math.min(window.devicePixelRatio || 1, ratioCap);
  canvas.width = Math.round(innerWidth * ratio);
  canvas.height = Math.round(innerHeight * ratio);
  lastDrawnFrame = -1;
  draw(Math.round(displayFrame));
}

function draw(index) {
  const image = frames[index];
  if (!image?.complete || !image.naturalWidth) return;

  const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  lastDrawnFrame = index;
}

function panelVisibility(progress, start, end) {
  const fade = Math.min(0.065, (end - start) * 0.28);
  if (progress < start || progress > end) return 0;
  if (progress < start + fade) return (progress - start) / fade;
  if (progress > end - fade) return (end - progress) / fade;
  return 1;
}

function updatePanels(progress) {
  if (mobileLayoutQuery.matches) {
    const viewportAnchor = innerHeight * 0.34;
    let activeIndex = 0;
    let closestDistance = Infinity;

    panels.forEach((panel, index) => {
      panel.style.setProperty("--reveal", "1");
      panel.style.setProperty("--shift", "0px");
      panel.style.opacity = "1";
      panel.style.transform = "none";
      panel.classList.add("is-interactive");
      panel.setAttribute("aria-hidden", "false");

      const bounds = panel.getBoundingClientRect();
      const distance = viewportAnchor < bounds.top
        ? bounds.top - viewportAnchor
        : viewportAnchor > bounds.bottom
          ? viewportAnchor - bounds.bottom
          : 0;
      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });

    if (metricsPanel) {
      const bounds = metricsPanel.getBoundingClientRect();
      updateMetricCounters(bounds.top < innerHeight * 0.72 && bounds.bottom > innerHeight * 0.28);
    }

    navItems.forEach((item) => {
      const isActive = Number(item.dataset.panel) === activeIndex;
      item.classList.toggle("is-active", isActive);
      if (isActive) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    const activeLink = navItems.find((item) => Number(item.dataset.panel) === activeIndex);
    if (activeLink && location.hash !== activeLink.hash) history.replaceState(null, "", activeLink.hash);
    return;
  }
  let activeIndex = 0;
  let closestDistance = Infinity;
  panels.forEach((panel) => {
    const start = Number(panel.dataset.start);
    const end = Number(panel.dataset.end);
    const opacity = Math.max(0, Math.min(1, panelVisibility(progress, start, end)));
    panel.style.setProperty("--reveal", opacity.toFixed(3));
    panel.style.setProperty("--shift", `${((1 - opacity) * 46).toFixed(2)}px`);
    panel.style.opacity = opacity.toFixed(3);
    panel.style.transform = `translate3d(0, ${(1 - opacity) * 24}px, 0) scale(${(0.992 + opacity * 0.008).toFixed(4)})`;
    panel.classList.toggle("is-interactive", opacity >= 0.5);
    panel.setAttribute("aria-hidden", opacity < 0.05 ? "true" : "false");
    if (panel === metricsPanel) updateMetricCounters(opacity >= 0.5);
    const center = (start + end) / 2;
    const distance = Math.abs(progress - center);
    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = panels.indexOf(panel);
    }
  });
  navItems.forEach((item) => {
    const isActive = Number(item.dataset.panel) === activeIndex;
    item.classList.toggle("is-active", isActive);
    if (isActive) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
}

let navCloseTimer;
function setNavOpen(isOpen) {
  clearTimeout(navCloseTimer);
  dynamicNav.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}
navToggle.addEventListener("click", () => setNavOpen(!dynamicNav.classList.contains("is-open")));
const hoverNavQuery = matchMedia("(hover: hover) and (pointer: fine)");
navPill.addEventListener("pointerenter", () => { if (hoverNavQuery.matches) setNavOpen(true); });
navPill.addEventListener("pointerleave", () => { if (hoverNavQuery.matches) navCloseTimer = setTimeout(() => setNavOpen(false), 350); });
dynamicNav.addEventListener("focusout", () => { navCloseTimer = setTimeout(() => { if (!dynamicNav.contains(document.activeElement)) setNavOpen(false); }, 0); });

function scrollToPanel(panelIndex, behavior = "smooth", updateHistory = false, hash = "") {
  const panel = panels[panelIndex];
  if (!panel) return;

  if (mobileLayoutQuery.matches) {
    const resolvedBehavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : behavior;
    panel.scrollIntoView({ behavior: resolvedBehavior, block: "start" });
    if (updateHistory && hash && location.hash !== hash) history.pushState(null, "", hash);
    return;
  }

  const scrollRange = document.documentElement.scrollHeight - innerHeight;
  const panelCenter = (Number(panel.dataset.start) + Number(panel.dataset.end)) / 2;
  scrollTo({ top: panelCenter * scrollRange, behavior });

  if (updateHistory && hash && location.hash !== hash) {
    history.pushState(null, "", hash);
  }
}

function scrollToCurrentHash(behavior = "auto") {
  const matchingLink = panelLinks.find((item) => item.hash === location.hash);
  if (matchingLink) scrollToPanel(Number(matchingLink.dataset.panel), behavior);
}

panelLinks.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    scrollToPanel(Number(item.dataset.panel), "smooth", true, item.hash);
    if (dynamicNav.contains(item)) setNavOpen(false);
  });
});

addEventListener("popstate", () => scrollToCurrentHash("smooth"));

document.addEventListener("pointerdown", (event) => { if (!dynamicNav.contains(event.target)) setNavOpen(false); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") { setNavOpen(false); navToggle.focus(); } });

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addEventListener("pointermove", (event) => {
    requestAnimationFrame(() => pupils.forEach((pupil) => {
      const eye = pupil.parentElement.getBoundingClientRect();
      const x = Math.max(-4, Math.min(4, (event.clientX - (eye.left + eye.width / 2)) / 22));
      const y = Math.max(-4, Math.min(4, (event.clientY - (eye.top + eye.height / 2)) / 22));
      pupil.style.transform = `translate(${x}px, ${y}px)`;
    }));
  }, { passive: true });
}

if (orbitTrack && orbitViewport) {
  const originals = [...orbitTrack.children];
  const before = document.createDocumentFragment();
  const after = document.createDocumentFragment();
  originals.forEach((card) => {
    const first = card.cloneNode(true);
    const third = card.cloneNode(true);
    first.tabIndex = -1; third.tabIndex = -1;
    first.setAttribute("aria-hidden", "true"); third.setAttribute("aria-hidden", "true");
    before.append(first); after.append(third);
    card.setAttribute("aria-label", `Center ${card.dataset.title}`);
  });
  orbitTrack.prepend(before);
  orbitTrack.append(after);
  const allCards = [...orbitTrack.children];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let orbitX = 0;
  let orbitVelocity = -0.28;
  let repetitionWidth = 0;
  let dragging = false;
  let previousPointerX = 0;
  let activeOrbitIndex = -1;
  function measureOrbit() { repetitionWidth = orbitTrack.scrollWidth / 3; if (!orbitX) orbitX = -repetitionWidth; }
  function updateOrbitCaption(index) {
    const normalized = ((index % originals.length) + originals.length) % originals.length;
    if (normalized === activeOrbitIndex) return;
    activeOrbitIndex = normalized;
    const source = originals[normalized];
    document.querySelector(".orbit-count").textContent = `${String(normalized + 1).padStart(2, "0")} / ${String(originals.length).padStart(2, "0")}`;
    document.querySelector(".orbit-title").textContent = source.dataset.title;
    document.querySelector(".orbit-issuer").textContent = source.dataset.issuer;
    document.querySelector(".orbit-caption").style.setProperty("--orbit-progress", `${((normalized + 1) / originals.length) * 100}%`);
  }
  function renderOrbit() {
    if (!reduced) {
      if (!dragging) { orbitX += orbitVelocity; orbitVelocity *= 0.955; if (Math.abs(orbitVelocity) < 0.22) orbitVelocity = -0.22; }
      if (orbitX < -repetitionWidth * 2) orbitX += repetitionWidth;
      if (orbitX > -repetitionWidth * 0.15) orbitX -= repetitionWidth;
      orbitTrack.style.transform = `translate3d(${orbitX}px,0,0)`;
      const viewportRect = orbitViewport.getBoundingClientRect();
      let nearest = 0;
      let nearestDistance = Infinity;
      allCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const delta = (rect.left + rect.width / 2 - (viewportRect.left + viewportRect.width / 2)) / (viewportRect.width * 0.52);
        const distance = Math.min(Math.abs(delta), 1.7);
        const focus = Math.max(0, 1 - distance);
        card.style.setProperty("--gallery-x", delta.toFixed(3));
        card.style.setProperty("--gallery-focus", focus.toFixed(3));
        card.style.zIndex = String(Math.round(focus * 100));
        if (distance < nearestDistance) { nearestDistance = distance; nearest = index; }
      });
      allCards.forEach((card, index) => card.classList.toggle("is-orbit-active", index === nearest));
      updateOrbitCaption(nearest);
      requestAnimationFrame(renderOrbit);
    }
  }
  orbitViewport.addEventListener("pointerdown", (event) => { dragging = true; previousPointerX = event.clientX; orbitVelocity = 0; orbitViewport.setPointerCapture(event.pointerId); });
  orbitViewport.addEventListener("pointermove", (event) => { const bounds = orbitViewport.getBoundingClientRect(); orbitViewport.style.setProperty("--pointer-y", ((event.clientY - bounds.top) / bounds.height - .5).toFixed(3)); if (!dragging) return; const delta = event.clientX - previousPointerX; orbitX += delta; orbitVelocity = delta * 0.85; previousPointerX = event.clientX; });
  orbitViewport.addEventListener("pointerleave", () => orbitViewport.style.setProperty("--pointer-y", "0"));
  const releaseOrbit = (event) => { dragging = false; if (orbitViewport.hasPointerCapture(event.pointerId)) orbitViewport.releasePointerCapture(event.pointerId); };
  orbitViewport.addEventListener("pointerup", releaseOrbit);
  orbitViewport.addEventListener("pointercancel", releaseOrbit);
  orbitViewport.addEventListener("keydown", (event) => { if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return; event.preventDefault(); orbitVelocity += event.key === "ArrowLeft" ? 7 : -7; });
  allCards.forEach((card) => card.addEventListener("click", () => { const cardRect = card.getBoundingClientRect(); const viewRect = orbitViewport.getBoundingClientRect(); orbitX -= cardRect.left + cardRect.width / 2 - (viewRect.left + viewRect.width / 2); orbitVelocity = 0; }));
  addEventListener("resize", measureOrbit, { passive: true });
  measureOrbit();
  if (!reduced) requestAnimationFrame(renderOrbit);
}

const contactForm = document.querySelector(".contact-form");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = contactForm.querySelector(".form-status");
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(data.get("subject") || "Portfolio enquiry");
  const body = encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
  status.textContent = "Opening your email app…";
  contactForm.classList.add("is-submitted");
  window.location.href = `mailto:kamaleshjk102007@gmail.com?subject=${subject}&body=${body}`;
});

document.querySelectorAll(".project-grid article").forEach((card) => {
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-pressed", "false");
  card.addEventListener("pointermove", (event) => {
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--card-rx", `${(-y * 7).toFixed(2)}deg`);
    card.style.setProperty("--card-ry", `${(x * 8).toFixed(2)}deg`);
    card.style.setProperty("--card-x", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--card-y", `${(y + 0.5) * 100}%`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--card-rx", "0deg");
    card.style.setProperty("--card-ry", "0deg");
  });
  const toggleProjectCard = () => {
    const grid = card.closest(".project-grid");
    const wasSelected = card.classList.contains("is-selected");
    grid.querySelectorAll("article").forEach((item) => {
      item.classList.remove("is-selected");
      item.setAttribute("aria-pressed", "false");
      const action = item.querySelector("footer strong");
      if (action) action.textContent = "View Project →";
    });
    if (!wasSelected) { card.classList.add("is-selected"); card.setAttribute("aria-pressed", "true"); }
    const action = card.querySelector("footer strong");
    if (action && !wasSelected) action.textContent = "Close ↑";
    grid.classList.toggle("has-selection", !wasSelected);
  };
  card.addEventListener("click", toggleProjectCard);
  card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleProjectCard(); } });
});


const projectCards = [...document.querySelectorAll(".project-grid article")];
const projectRepoUrls = [
  "https://github.com/kamaleshjk102007-dot/sentinal_V1",
  "https://github.com/kamaleshjk102007-dot/sentinal_V2",
  "https://github.com/kamaleshjk102007-dot/edith",
  "https://github.com/kamaleshjk102007-dot/ride_guide",
  "https://github.com/kamaleshjk102007-dot/safe",
  "https://github.com/kamaleshjk102007-dot/shop_floor",
  "https://github.com/kamaleshjk102007-dot/accident",
  "https://github.com/kamaleshjk102007-dot/Customer-Segmentation-Dashboard",
  "https://github.com/kamaleshjk102007-dot/Sales-Revenue-Analytics",
  "https://github.com/kamaleshjk102007-dot/face_Recognition",
  "https://github.com/kamaleshjk102007-dot/the-last-signal",
];
projectCards.forEach((card) => {
  card.addEventListener("pointerenter", () => card.classList.add("is-hovered"));
  card.addEventListener("pointerleave", () => card.classList.remove("is-hovered"));
});
const projectMeta = [
  ["Smart Online Exam Monitoring",["YOLOv8","Webcam","Alerts"]],
  ["AI-Powered Proctoring System",["YOLOv11","MediaPipe","FastAPI"]],
  ["Multi-Agent AI Assistant",["Python","React","Gemini"]],
  ["Mobile-First Amusement Park Platform",["QR Tickets","Payments","Analytics"]],
  ["Community Emergency Alert Network",["Live GPS","Alerts","Community"]],
  ["AI Workforce Management",["Flutter","Gemini","MongoDB"]],
  ["Machine-Learning Safety Study",["EDA","Bayesian Ridge","Analytics"]],
  ["Customer Intelligence Dashboard",["K-Means","Power BI","Retention"]],
  ["Interactive Business Dashboard",["CSV / Excel","Revenue","Trends"]],
  ["Neural Computer-Vision Studio",["Flask","ONNX","OpenCV"]],
  ["Browser Survival Horror Game",["Health","Power","Sanity"]]
];
const projectIcons = [
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19v-5M10 19V9M15 19v-8M20 19V5"/><path d="m4 10 5-4 4 3 7-6"/></svg>'
];
const projectStats = [[23,7],[31,9],[28,8],[18,5],[16,4],[26,7],[14,3],[22,6],[19,4],[17,5],[12,3]];
projectCards.forEach((card,index) => {
  card.dataset.projectIndex = String(index + 1).padStart(2, "0");
  const number = card.querySelector("b");
  const title = card.querySelector("h3");
  const media = document.createElement("div");
  media.className = "showcase-media";
  media.setAttribute("role", "img");
  media.setAttribute("aria-label", `${title.textContent} project artwork`);
  media.style.setProperty("--atlas-x", `${(index % 3) * 50}%`);
  media.style.setProperty("--atlas-y", `${Math.floor(index / 3) * 50}%`);
  card.prepend(media);
  const header = document.createElement("div");
  header.className = "project-card-head";
  media.after(header);
  header.append(number,title);
  number.innerHTML = projectIcons[index % projectIcons.length];
  title.insertAdjacentHTML("afterend", `<small class="project-kind">${projectMeta[index][0]}</small>`);
  const stats = projectStats[index] || ["—","—"];
  card.insertAdjacentHTML("beforeend", `<div class="project-tech">${projectMeta[index][1].map((tag) => `<span>${tag}</span>`).join("")}</div><footer><small class="project-stats"><span>☆ ${stats[0]}</span><span>⑂ ${stats[1]}</span></small><a class="project-card-link" href="${projectRepoUrls[index]}" target="_blank" rel="noopener noreferrer" aria-label="Open ${title.textContent} repository on GitHub">View Repository →</a></footer>`);
  card.querySelector(".project-card-link").addEventListener("click", (event) => event.stopPropagation());
  card.hidden = index > 2;
});

const projectsCarousel = document.querySelector(".projects-panel .project-carousel");
const projectsToggle = document.createElement("button");
projectsToggle.className = "projects-toggle";
projectsToggle.type = "button";
projectsToggle.setAttribute("aria-expanded", "false");
projectsToggle.innerHTML = '<span>View All Projects</span><i aria-hidden="true">⌘</i>';
projectsCarousel?.append(projectsToggle);
projectsToggle.addEventListener("click", () => {
  const expanded = projectsCarousel.classList.toggle("show-all");
  projectsToggle.setAttribute("aria-expanded", String(expanded));
  projectsToggle.querySelector("span").textContent = expanded ? "Show Featured Projects" : "View All Projects";
  projectsToggle.querySelector("i").textContent = expanded ? "×" : "⌘";
  projectCards.forEach((card, index) => {
    card.hidden = !expanded && index > 2;
    card.classList.remove("is-revealing");
    if (expanded && index > 2) {
      requestAnimationFrame(() => {
        card.style.setProperty("--reveal-delay", `${(index - 3) * 55}ms`);
        card.classList.add("is-revealing");
      });
    }
  });
});

const mobileProjectsQuery = mobileLayoutQuery;
function syncProjectVisibility() {
  const mobile = mobileProjectsQuery.matches;
  const expanded = projectsToggle.getAttribute("aria-expanded") === "true";
  projectCards.forEach((card, index) => { card.hidden = mobile ? false : !expanded && index > 2; });
  projectsToggle.hidden = mobile;
}
syncProjectVisibility();
mobileProjectsQuery.addEventListener?.("change", syncProjectVisibility);
const projectStage = document.createElement("div");
projectStage.className = "project-stage";
projectStage.innerHTML = `
  <div class="project-stage__visual" role="img" aria-label="Project artwork">
    <div class="project-stage__shade"></div>
    <div class="project-stage__counter"><span>01</span><small>/ ${String(projectCards.length).padStart(2, "0")}</small></div>
    <div class="project-stage__copy">
      <p class="project-stage__kind"></p>
      <h2></h2>
      <p class="project-stage__description"></p>
      <div class="project-stage__tags"></div>
      <a class="project-stage__open" href="#" target="_blank" rel="noopener noreferrer">Explore Repository <span>↗</span></a>
    </div>
    <div class="project-stage__controls">
      <button type="button" data-direction="-1" aria-label="Previous project">←</button>
      <button type="button" data-direction="1" aria-label="Next project">→</button>
    </div>
  </div>
  <div class="project-stage__index" aria-label="Project index"></div>`;
projectsCarousel?.before(projectStage);

const stageVisual = projectStage.querySelector(".project-stage__visual");
const stageTitle = projectStage.querySelector("h2");
const stageKind = projectStage.querySelector(".project-stage__kind");
const stageDescription = projectStage.querySelector(".project-stage__description");
const stageTags = projectStage.querySelector(".project-stage__tags");
const stageCounter = projectStage.querySelector(".project-stage__counter span");
const stageIndex = projectStage.querySelector(".project-stage__index");
const stageOpen = projectStage.querySelector(".project-stage__open");
let activeProject = 0;

projectCards.forEach((card, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.innerHTML = `<span>${String(index + 1).padStart(2,"0")}</span><strong>${card.querySelector("h3").textContent}</strong><i>↗</i>`;
  button.addEventListener("click", () => updateProjectStage(index));
  button.addEventListener("pointerenter", () => updateProjectStage(index));
  button.addEventListener("focus", () => updateProjectStage(index));
  stageIndex.append(button);
});

function updateProjectStage(index) {
  activeProject = (index + projectCards.length) % projectCards.length;
  const card = projectCards[activeProject];
  stageVisual.classList.remove("is-changing");
  void stageVisual.offsetWidth;
  stageVisual.style.setProperty("--atlas-x", `${(activeProject % 3) * 50}%`);
  stageVisual.style.setProperty("--atlas-y", `${Math.floor(activeProject / 3) * 50}%`);
  stageTitle.textContent = card.querySelector("h3").textContent;
  stageKind.textContent = projectMeta[activeProject][0];
  stageDescription.textContent = card.querySelector(":scope > p").textContent;
  stageTags.innerHTML = projectMeta[activeProject][1].map((tag) => `<span>${tag}</span>`).join("");
  stageCounter.textContent = String(activeProject + 1).padStart(2,"0");
  stageOpen.href = projectRepoUrls[activeProject];
  stageOpen.setAttribute("aria-label", `Open ${stageTitle.textContent} repository on GitHub`);
  [...stageIndex.children].forEach((button, buttonIndex) => button.classList.toggle("is-active", buttonIndex === activeProject));
  stageVisual.setAttribute("aria-label", `${stageTitle.textContent} project artwork`);
  stageVisual.classList.add("is-changing");
}
projectStage.querySelectorAll(".project-stage__controls button").forEach((button) => {
  button.addEventListener("click", () => updateProjectStage(activeProject + Number(button.dataset.direction)));
});
projectStage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") updateProjectStage(activeProject - 1);
  if (event.key === "ArrowRight") updateProjectStage(activeProject + 1);
});
projectStage.tabIndex = 0;
updateProjectStage(0);

const hoverProjectList = document.createElement("div");
hoverProjectList.className = "project-hover-list";
hoverProjectList.innerHTML = `<header><p>07 / ${String(projectCards.length).padStart(2, "0")} PROJECTS</p><h2>All <em>builds.</em></h2></header><div class="project-hover-list__rows"></div><aside class="project-hover-preview" aria-live="polite"></aside>`;
projectStage.before(hoverProjectList);
const hoverRows = hoverProjectList.querySelector(".project-hover-list__rows");
const hoverPreview = hoverProjectList.querySelector(".project-hover-preview");

function updateHoverPreview(index) {
  const card = projectCards[index];
  const title = card.querySelector("h3").textContent;
  const description = card.querySelector(":scope > p").textContent;
  hoverPreview.style.setProperty("--atlas-x", `${(index % 3) * 50}%`);
  hoverPreview.style.setProperty("--atlas-y", `${Math.floor(index / 3) * 50}%`);
  hoverPreview.innerHTML = `
    <div class="project-hover-preview__image" role="img" aria-label="${title} project artwork"></div>
    <div class="project-hover-preview__content">
      <p class="project-hover-preview__number">${String(index + 1).padStart(2, "0")} / ${String(projectCards.length).padStart(2, "0")}</p>
      <h3>${title}</h3>
      <p>${description}</p>
      <div>${projectMeta[index][1].map((tag) => `<small>${tag}</small>`).join("")}</div>
    </div>`;
}

projectCards.forEach((card, index) => {
  const rowTitle = card.querySelector("h3").textContent;
  const row = document.createElement("article");
  row.className = "project-hover-row";
  row.tabIndex = 0;
  row.style.setProperty("--atlas-x", `${(index % 3) * 50}%`);
  row.style.setProperty("--atlas-y", `${Math.floor(index / 3) * 50}%`);
  row.innerHTML = `
    <span class="project-hover-row__number">${String(index + 1).padStart(2, "0")}</span>
    <div class="project-hover-row__text">
      <h3>${card.querySelector("h3").textContent}</h3>
      <p>${card.querySelector(":scope > p").textContent}</p>
      <div>${projectMeta[index][1].map((tag) => `<small>${tag}</small>`).join("")}</div>
    </div>
    <div class="project-hover-row__image" role="img" aria-label="${card.querySelector("h3").textContent} project artwork"></div>
    <a class="project-hover-row__icon" href="${projectRepoUrls[index]}" target="_blank" rel="noopener noreferrer" aria-label="Open ${rowTitle} repository on GitHub">↗</a>`;
  const activate = () => {
    hoverRows.querySelectorAll(".project-hover-row").forEach((item) => item.classList.remove("is-open"));
    row.classList.add("is-open");
    updateHoverPreview(index);
  };
  row.addEventListener("pointerenter", activate);
  row.addEventListener("focus", activate);
  row.addEventListener("click", activate);
  hoverRows.append(row);
});
updateHoverPreview(0);

const projectStrip = document.querySelector(".project-grid");
let projectDragStart = 0;
let projectScrollStart = 0;
projectStrip?.addEventListener("pointerdown", (event) => {
  projectDragStart = event.clientX;
  projectScrollStart = projectStrip.scrollLeft;
  projectStrip.classList.add("is-dragging");
  projectStrip.setPointerCapture(event.pointerId);
});
projectStrip?.addEventListener("pointermove", (event) => {
  if (!projectStrip.classList.contains("is-dragging")) return;
  projectStrip.scrollLeft = projectScrollStart - (event.clientX - projectDragStart);
});
const stopProjectDrag = () => projectStrip?.classList.remove("is-dragging");
projectStrip?.addEventListener("pointerup", stopProjectDrag);
projectStrip?.addEventListener("pointercancel", stopProjectDrag);

function updateTarget() {
  const scrollRange = document.documentElement.scrollHeight - innerHeight;
  const progress = scrollRange > 0 ? scrollY / scrollRange : 0;
  targetFrame = progress * (frameCount - 1);
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(animate);
  }
}

function animate() {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smoothing = mobileMotionQuery.matches ? 0.18 : 0.115;
  displayFrame += (targetFrame - displayFrame) * (reducedMotion ? 1 : smoothing);
  const frame = Math.max(0, Math.min(frameCount - 1, Math.round(displayFrame)));
  const progress = displayFrame / (frameCount - 1);

  if (frame !== lastDrawnFrame) draw(frame);
  updatePanels(progress);

  if (Math.abs(targetFrame - displayFrame) > 0.01) {
    requestAnimationFrame(animate);
  } else {
    displayFrame = targetFrame;
    ticking = false;
  }
}

addEventListener("scroll", updateTarget, { passive: true });
addEventListener("resize", resize, { passive: true });
mobileMotionQuery.addEventListener?.("change", () => {
  resize();
  updateTarget();
});
mobileLayoutQuery.addEventListener?.("change", updateTarget);

preloadFrames();
resize();
updateTarget();

if (location.hash) {
  addEventListener("load", () => {
    scrollToCurrentHash();
    updateTarget();
  }, { once: true });
}
