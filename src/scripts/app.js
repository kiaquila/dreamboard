import { translations } from "./i18n.js";
import { LANDING_PHOTO_JACKET } from "./landing-photo.js";
import {
  readDraftSnapshot,
  writeDraftSnapshot,
  writeDraftSnapshotSyncFallback,
} from "./draft-store.js";

const LANG_KEYS = Object.keys(translations);
const browserLang = navigator.language.split("-")[0].toUpperCase();
let currentLang = LANG_KEYS.includes(browserLang)
  ? browserLang
  : LANG_KEYS[0] || "RU";
const MOBILE_BREAKPOINT = 900;
const DRAFT_SCHEMA_VERSION = 1;
const DRAFT_SAVE_DEBOUNCE_MS = 500;

const landingView = document.getElementById("landingView");
const editorView = document.getElementById("editorView");
const canvasArea = document.querySelector(".canvas-area");
const heroGoButton = document.getElementById("l-go-btn");
const finalGoButton = document.getElementById("l-final-btn");
const landingLangButton = document.getElementById("langBtn");
const editorLangButton = document.getElementById("langBtnEditor");
const editorMobileLangButton = document.getElementById("langBtnEditorMobile");
const editorBackButton = document.getElementById("editorBackBtn");
const editorBackButtonMobile = document.getElementById("editorBackBtnMobile");
const rotateHintBackButton = document.getElementById("rotateHintBackBtn");
const fileInput = document.getElementById("fileInput");
const addTextButton = document.getElementById("t-addtext");
const downloadButton = document.getElementById("t-download");
const saveIndicator = document.getElementById("saveIndicator");
const saveIndicatorMobile = document.getElementById("saveIndicatorMobile");

// Editor elements
const objectMenu = document.getElementById("objectMenu");
const omTextColor = document.getElementById("om-textColor");
const omColorBtn = document.getElementById("om-colorBtn");
const omForward = document.getElementById("om-forward");
const omBackward = document.getElementById("om-backward");
const omDelete = document.getElementById("om-delete");
const omCopy = document.getElementById("om-copy");
const omBold = document.getElementById("om-bold");
const omItalic = document.getElementById("om-italic");
const omUnderline = document.getElementById("om-underline");
const colorPopup = document.getElementById("colorPopup");
const fontPopup = document.getElementById("fontPopup");
const omFontFamilyBtn = document.getElementById("om-fontFamilyBtn");
const omFontFamilyLabel = document.getElementById("om-fontFamilyLabel");

// Editor mobile sidebar controls
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");

const FONT_FAMILIES = [
  "DM Sans",
  "Playfair Display",
  "Montserrat",
  "Lora",
  "Oswald",
  "Raleway",
  "Poppins",
  "Merriweather",
  "Pacifico",
  "Caveat",
  "Dancing Script",
  "Anton",
  "Ubuntu",
  "Marck Script",
  "Bad Script",
];

let placeholders = [];
let draftSaveTimer = null;
let suppressDraftPersistence = false;
let currentSaveStatusKey = "saveIdle";
let draftBootstrapComplete = false;
let draftBootstrapPromise = null;

const canvas = new fabric.Canvas("visionBoard", {
  width: 960,
  height: 640,
  backgroundColor: "#ffffff",
  preserveObjectStacking: true,
});

function isMobileLayout() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function syncMenuButtonState() {
  if (!mobileMenuBtn) return;

  mobileMenuBtn.setAttribute(
    "aria-expanded",
    sidebar.classList.contains("is-open") ? "true" : "false",
  );
}

function openSidebar() {
  if (!isMobileLayout()) return;
  sidebar.classList.add("is-open");
  sidebarOverlay.classList.add("is-open");
  syncMenuButtonState();
}

function closeSidebar() {
  sidebar.classList.remove("is-open");
  sidebarOverlay.classList.remove("is-open");
  syncMenuButtonState();
}

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    if (!sidebar.classList.contains("is-open")) openSidebar();
    else closeSidebar();
  });
}
if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);
syncMenuButtonState();

function applyToolbarTooltips() {
  const t = translations[currentLang];
  omDelete.setAttribute("data-tooltip", t.ttDelete);
  omCopy.setAttribute("data-tooltip", t.ttCopy);

  omForward.setAttribute("data-tooltip", t.ttForward);
  omBackward.setAttribute("data-tooltip", t.ttBackward);

  omBold.setAttribute("data-tooltip", t.ttBold);
  omItalic.setAttribute("data-tooltip", t.ttItalic);
  omUnderline.setAttribute("data-tooltip", t.ttUnderline);

  omColorBtn.setAttribute("data-tooltip", t.ttColor);
  omFontFamilyBtn.setAttribute("data-tooltip", t.ttFont);
}

function setSaveStatus(statusKey) {
  currentSaveStatusKey = statusKey;
  const label = translations[currentLang]?.[statusKey] || "";

  [saveIndicator, saveIndicatorMobile].forEach((node) => {
    if (!node) return;
    node.textContent = label;
    node.hidden = !label;
  });
}

function applyLanguageUI({ syncPlaceholders = true } = {}) {
  const t = translations[currentLang];

  // landing
  const heroTitleEl = document.getElementById("l-hero-title");
  const goBtnEl = document.getElementById("l-go-btn");
  const whatTitleEl = document.getElementById("l-what-title");
  const whatTextEl = document.getElementById("l-what-text");
  const rulesTitleEl = document.getElementById("l-rules-title");
  const finalTitleEl = document.getElementById("l-final-title");
  const finalBtnEl = document.getElementById("l-final-btn");

  if (heroTitleEl) heroTitleEl.innerText = t.landingHero;
  if (goBtnEl) goBtnEl.innerText = t.landingGo;

  if (whatTitleEl) whatTitleEl.innerText = t.landingWhatTitle;
  if (whatTextEl) whatTextEl.innerText = t.landingWhatText;

  if (rulesTitleEl) rulesTitleEl.innerText = t.landingRulesTitle;
  renderLandingRules();

  if (finalTitleEl) finalTitleEl.innerText = t.landingFinalTitle;
  if (finalBtnEl) finalBtnEl.innerText = t.landingGo;

  // donate modal
  const donateTitleEl = document.getElementById("donateModalTitle");
  const donateTextEl = document.getElementById("donateModalText");
  const donateCtaEl = document.getElementById("donateMatecitoLabel");
  if (donateTitleEl) donateTitleEl.innerText = t.donateTitle;
  if (donateTextEl) donateTextEl.innerHTML = t.donateTextHtml;
  if (donateCtaEl) donateCtaEl.innerText = t.donateCta;

  // editor sidebar
  document.getElementById("t-images").innerText = t.images;
  document.getElementById("t-upload").innerText = t.upload;
  document.getElementById("t-addtext").innerText = t.addtext;
  document.getElementById("t-download").innerText = t.download;
  document.getElementById("rotateHintTitle").innerText = t.rotateHintTitle;
  document.getElementById("rotateHintText").innerText = t.rotateHintText;
  editorBackButton?.setAttribute("aria-label", t.backHome);
  editorBackButtonMobile?.setAttribute("aria-label", t.backHome);
  rotateHintBackButton?.setAttribute("aria-label", t.backHome);
  editorBackButton?.setAttribute("data-tooltip", t.backHome);
  editorBackButton?.setAttribute("title", t.backHome);
  editorBackButtonMobile?.setAttribute("data-tooltip", t.backHome);
  editorBackButtonMobile?.setAttribute("title", t.backHome);
  rotateHintBackButton?.setAttribute("data-tooltip", t.backHome);
  rotateHintBackButton?.setAttribute("title", t.backHome);

  // lang labels (landing + editor)
  document.getElementById("langBtn").innerText = currentLang;
  document.getElementById("langBtnEditor").innerText = currentLang;
  if (editorMobileLangButton) {
    editorMobileLangButton.innerText = currentLang;
  }

  // html lang
  document.documentElement.lang = currentLang.toLowerCase();

  if (syncPlaceholders) {
    createPlaceholders();
  }
  applyToolbarTooltips();
  setSaveStatus(currentSaveStatusKey);
}

function toggleLang() {
  const currentIndex = LANG_KEYS.indexOf(currentLang);
  currentLang = LANG_KEYS[(currentIndex + 1) % LANG_KEYS.length];
  applyLanguageUI();
  if (draftBootstrapComplete) {
    scheduleDraftSave();
  }
}

function scrollToSlide(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
function setLandingPhotos() {
  const img = document.querySelector(".slide-visual-photo .slide-photo");
  if (img) {
    img.src = LANDING_PHOTO_JACKET;
  }
}

function updateLandingViewportVars() {
  // Stable 100% viewport height on mobile + reacts to resize
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--landing-vh", `${vh}px`);

  const header = document.querySelector(".landing-header");
  if (header) {
    document.documentElement.style.setProperty(
      "--landing-header-h",
      `${header.offsetHeight}px`,
    );
  }
}

function renderLandingRules() {
  const t = translations[currentLang];
  const ul = document.getElementById("l-rules-list");
  if (!ul) return;

  ul.innerHTML = "";
  (t.landingRules || []).forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    ul.appendChild(li);
  });
}

function syncBodyOverflow() {
  const donateModalOpen =
    donateOverlay && donateOverlay.style.display === "flex";
  document.body.style.overflow =
    donateModalOpen || document.body.classList.contains("is-editor-active")
      ? "hidden"
      : "";
}

async function requestLandscapeOrientation() {
  if (!isMobileLayout() || !screen.orientation?.lock) return;

  try {
    await screen.orientation.lock("landscape");
  } catch (error) {
    // iOS Safari and several browsers ignore or block this unless fullscreen.
  }
}

function buildDraftSnapshot() {
  return {
    schemaVersion: DRAFT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    lang: currentLang,
    canvas: {
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      backgroundColor: "#ffffff",
      objects: canvas
        .getObjects()
        .filter((object) => !object.isPlaceholder)
        .map((object) => object.toObject()),
    },
  };
}

async function persistDraftSnapshot(snapshot = buildDraftSnapshot()) {
  if (suppressDraftPersistence) return;

  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer);
    draftSaveTimer = null;
  }

  try {
    await writeDraftSnapshot(snapshot);
    setSaveStatus("saveSaved");
  } catch (error) {
    console.error("Could not persist dreamboard draft.", error);
    setSaveStatus("saveError");
  }
}

function scheduleDraftSave({ immediate = false } = {}) {
  if (!draftBootstrapComplete || suppressDraftPersistence) return;

  setSaveStatus("saveSaving");

  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer);
  }

  if (immediate) {
    void persistDraftSnapshot();
    return;
  }

  draftSaveTimer = window.setTimeout(() => {
    void persistDraftSnapshot();
  }, DRAFT_SAVE_DEBOUNCE_MS);
}

async function restoreDraftSnapshot(snapshot) {
  if (
    !snapshot ||
    snapshot.schemaVersion !== DRAFT_SCHEMA_VERSION ||
    !snapshot.canvas
  ) {
    return;
  }

  suppressDraftPersistence = true;

  await new Promise((resolve) => {
    canvas.loadFromJSON(
      {
        version: "5.3.1",
        background: snapshot.canvas.backgroundColor || "#ffffff",
        objects: snapshot.canvas.objects || [],
      },
      () => {
        canvas.backgroundColor = snapshot.canvas.backgroundColor || "#ffffff";
        createPlaceholders();
        enforceTextOnTop();
        hideObjectMenu();
        hideColorPopup();
        hideFontPopup();
        canvas.renderAll();
        resolve();
      },
    );
  });

  suppressDraftPersistence = false;
}

async function bootstrapDraftState() {
  const snapshot = await readDraftSnapshot();

  if (snapshot?.lang && LANG_KEYS.includes(snapshot.lang)) {
    currentLang = snapshot.lang;
  }

  applyLanguageUI({ syncPlaceholders: !snapshot });
  if (snapshot) {
    await restoreDraftSnapshot(snapshot);
    setSaveStatus("saveSaved");
  } else {
    setSaveStatus("saveIdle");
  }

  draftBootstrapComplete = true;
}

function persistDraftOnExit() {
  if (!draftBootstrapComplete || suppressDraftPersistence) return;

  const snapshot = buildDraftSnapshot();
  writeDraftSnapshotSyncFallback(snapshot);
  void persistDraftSnapshot(snapshot);
}

async function goToEditor() {
  if (draftBootstrapPromise) {
    await draftBootstrapPromise;
  }
  landingView.style.display = "none";
  editorView.style.display = "block";
  document.body.classList.add("is-editor-active");
  syncBodyOverflow();
  closeSidebar();
  await requestLandscapeOrientation();
  requestAnimationFrame(() => {
    resizeCanvasToViewport();
  });
}

function goToLanding() {
  landingView.style.display = "block";
  editorView.style.display = "none";
  document.body.classList.remove("is-editor-active");
  closeSidebar();
  hideObjectMenu();
  hideColorPopup();
  hideFontPopup();
  syncBodyOverflow();
  requestAnimationFrame(() => {
    updateLandingViewportVars();
    landingView.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function hideColorPopup() {
  colorPopup.style.display = "none";
}

function hideFontPopup() {
  fontPopup.style.display = "none";
}

function positionColorPopup() {
  if (colorPopup.style.display !== "block") return;

  const canvasRect = canvas.upperCanvasEl.getBoundingClientRect();
  const menuRect = objectMenu.getBoundingClientRect();
  const popupRect = colorPopup.getBoundingClientRect();

  const menuTop = menuRect.top - canvasRect.top;

  const spaceAbove = menuRect.top - canvasRect.top;
  const spaceBelow =
    canvasRect.top + canvasRect.height - (menuRect.top + menuRect.height);

  let top;
  if (spaceBelow >= popupRect.height + 10 || spaceBelow >= spaceAbove) {
    top = menuTop + menuRect.height + 10;
  } else {
    top = menuTop - popupRect.height - 10;
  }

  const btnRect = omColorBtn.getBoundingClientRect();
  const btnCenterX = (btnRect.left + btnRect.right) / 2;
  let left = btnCenterX - canvasRect.left - popupRect.width / 2;

  const minLeft = 10;
  const maxLeft = canvasRect.width - popupRect.width - 10;
  left = Math.max(minLeft, Math.min(maxLeft, left));

  const minTop = 10;
  const maxTop = canvasRect.height - popupRect.height - 10;
  top = Math.max(minTop, Math.min(maxTop, top));

  colorPopup.style.left = left + "px";
  colorPopup.style.top = top + "px";
}

function positionFontPopup() {
  if (fontPopup.style.display !== "block") return;

  const canvasRect = canvas.upperCanvasEl.getBoundingClientRect();
  const menuRect = objectMenu.getBoundingClientRect();
  const popupRect = fontPopup.getBoundingClientRect();

  const menuTop = menuRect.top - canvasRect.top;

  const spaceAbove = menuRect.top - canvasRect.top;
  const spaceBelow =
    canvasRect.top + canvasRect.height - (menuRect.top + menuRect.height);

  let top;
  if (spaceBelow >= popupRect.height + 10 || spaceBelow >= spaceAbove) {
    top = menuTop + menuRect.height + 10;
  } else {
    top = menuTop - popupRect.height - 10;
  }

  const btnRect = omFontFamilyBtn.getBoundingClientRect();
  const btnCenterX = (btnRect.left + btnRect.right) / 2;
  let left = btnCenterX - canvasRect.left - popupRect.width / 2;

  const minLeft = 10;
  const maxLeft = canvasRect.width - popupRect.width - 10;
  left = Math.max(minLeft, Math.min(maxLeft, left));

  const minTop = 10;
  const maxTop = canvasRect.height - popupRect.height - 10;
  top = Math.max(minTop, Math.min(maxTop, top));

  fontPopup.style.left = left + "px";
  fontPopup.style.top = top + "px";
}

function toggleColorPopup() {
  hideFontPopup();
  colorPopup.style.display = "block";
  requestAnimationFrame(() => {
    positionColorPopup();
    omTextColor.click();
  });
}

function buildFontPopup(selectedFont) {
  fontPopup.innerHTML = "";
  FONT_FAMILIES.forEach((ff) => {
    const row = document.createElement("div");
    row.className = "font-option" + (ff === selectedFont ? " is-selected" : "");

    const name = document.createElement("div");
    name.className = "font-name";
    name.textContent = ff;
    name.style.fontFamily = ff;

    const check = document.createElement("div");
    check.className = "font-check";
    check.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"></path></svg>';

    row.appendChild(name);
    row.appendChild(check);

    row.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const obj = canvas.getActiveObject();
      if (!obj || !(obj.type === "i-text" || obj.type === "text")) return;

      obj.set("fontFamily", ff);
      omFontFamilyLabel.textContent = ff;

      hideFontPopup();
      canvas.renderAll();
      positionObjectMenu();
    });

    fontPopup.appendChild(row);
  });
}

function toggleFontPopup() {
  if (fontPopup.style.display === "block") {
    hideFontPopup();
    return;
  }

  const obj = canvas.getActiveObject();
  if (!obj || !(obj.type === "i-text" || obj.type === "text")) return;

  const currentFont = obj.fontFamily || "DM Sans";
  buildFontPopup(currentFont);

  hideColorPopup();
  fontPopup.style.display = "block";
  requestAnimationFrame(() => {
    positionFontPopup();
  });
}

omColorBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  toggleColorPopup();
});

omFontFamilyBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  toggleFontPopup();
});

landingLangButton?.addEventListener("click", toggleLang);
editorLangButton?.addEventListener("click", toggleLang);
editorMobileLangButton?.addEventListener("click", toggleLang);
heroGoButton?.addEventListener("click", goToEditor);
finalGoButton?.addEventListener("click", goToEditor);
editorBackButton?.addEventListener("click", goToLanding);
editorBackButtonMobile?.addEventListener("click", goToLanding);
rotateHintBackButton?.addEventListener("click", goToLanding);
addTextButton?.addEventListener("click", addText);
downloadButton?.addEventListener("click", exportBoard);
omForward.addEventListener("click", () => changeZIndex("forward"));
omBackward.addEventListener("click", () => changeZIndex("backward"));
omBold.addEventListener("click", toggleBold);
omItalic.addEventListener("click", toggleItalic);
omUnderline.addEventListener("click", toggleUnderline);
omCopy.addEventListener("click", duplicateSelectedText);
omDelete.addEventListener("click", deleteSelected);

document.addEventListener("pointerdown", (e) => {
  if (fontPopup.style.display === "block") {
    if (!fontPopup.contains(e.target) && !omFontFamilyBtn.contains(e.target)) {
      hideFontPopup();
    }
  }
});

function syncTextToolStates(obj) {
  const isBold = obj.fontWeight === "bold";
  const isItalic = obj.fontStyle === "italic";
  const isUnderline = !!obj.underline;

  omBold.classList.toggle("is-selected", isBold);
  omItalic.classList.toggle("is-selected", isItalic);
  omUnderline.classList.toggle("is-selected", isUnderline);
}

function toggleBold() {
  const obj = canvas.getActiveObject();
  if (!obj || !(obj.type === "i-text" || obj.type === "text")) return;
  const next = obj.fontWeight === "bold" ? "normal" : "bold";
  obj.set("fontWeight", next);
  canvas.renderAll();
  syncTextToolStates(obj);
  positionObjectMenu();
  scheduleDraftSave();
}

function toggleItalic() {
  const obj = canvas.getActiveObject();
  if (!obj || !(obj.type === "i-text" || obj.type === "text")) return;
  const next = obj.fontStyle === "italic" ? "normal" : "italic";
  obj.set("fontStyle", next);
  canvas.renderAll();
  syncTextToolStates(obj);
  positionObjectMenu();
  scheduleDraftSave();
}

function toggleUnderline() {
  const obj = canvas.getActiveObject();
  if (!obj || !(obj.type === "i-text" || obj.type === "text")) return;
  obj.set("underline", !obj.underline);
  canvas.renderAll();
  syncTextToolStates(obj);
  positionObjectMenu();
  scheduleDraftSave();
}

function duplicateSelectedText() {
  const obj = canvas.getActiveObject();
  if (!obj || !(obj.type === "i-text" || obj.type === "text")) return;

  obj.clone((cloned) => {
    const gap = 20;
    const w = obj.getScaledWidth
      ? obj.getScaledWidth()
      : obj.width * (obj.scaleX || 1);
    let newLeft = (obj.left || 0) + w + gap;
    let newTop = obj.top || 0;

    const maxLeft = canvas.getWidth() - 10;
    if (newLeft > maxLeft) newLeft = (obj.left || 0) - w - gap;

    cloned.set({
      left: newLeft,
      top: newTop,
      evented: true,
      selectable: true,
    });

    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
    positionObjectMenu();
    scheduleDraftSave();
  });
}

function createPlaceholders() {
  const previousSuppression = suppressDraftPersistence;
  suppressDraftPersistence = true;

  canvas
    .getObjects()
    .filter((object) => object.isPlaceholder)
    .forEach((object) => canvas.remove(object));
  placeholders = [];

  const w = canvas.width;
  const h = canvas.height;
  const langData = translations[currentLang].sectors;

  const positions = [
    { t: langData[0], x: w / 2, y: h / 2 },
    { t: langData[1], x: w / 2, y: h / 4.5 },
    { t: langData[2], x: w / 4, y: h / 2 },
    { t: langData[3], x: w / 4, y: h / 4.5 },
    { t: langData[4], x: w / 4, y: h / 1.3 },
    { t: langData[5], x: w / 2, y: h / 1.3 },
    { t: langData[6], x: (3 * w) / 4, y: h / 1.3 },
    { t: langData[7], x: (3 * w) / 4, y: h / 2 },
    { t: langData[8], x: (3 * w) / 4, y: h / 4.5 },
  ];

  placeholders = positions.map((item) => {
    const text = new fabric.Text(item.t, {
      left: item.x,
      top: item.y,
      fontSize: 18,
      fontFamily: "DM Sans",
      fontWeight: "bold",
      fill: "#f2f2f2",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
      isPlaceholder: true,
    });
    canvas.add(text);
    canvas.sendToBack(text);
    return text;
  });
  canvas.renderAll();
  suppressDraftPersistence = previousSuppression;
}

function enforceTextOnTop() {
  const texts = canvas
    .getObjects()
    .filter(
      (o) => (o.type === "i-text" || o.type === "text") && !o.isPlaceholder,
    );
  texts.forEach((t) => canvas.bringToFront(t));
  placeholders.forEach((p) => canvas.sendToBack(p));
  canvas.renderAll();
}

function layoutBatchImages(images) {
  const n = images.length;
  if (!n) return;

  const padding = 40;
  const gap = 40;

  const usableW = Math.max(1, canvas.width - padding * 2);
  const usableH = Math.max(1, canvas.height - padding * 2);

  let best = null;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);

    const cellW = (usableW - gap * (cols - 1)) / cols;
    const cellH = (usableH - gap * (rows - 1)) / rows;

    if (cellW <= 0 || cellH <= 0) continue;

    const score = Math.min(cellW, cellH);
    if (!best || score > best.score) best = { cols, rows, cellW, cellH, score };
  }

  const cols = best ? best.cols : 1;
  const cellW = best ? best.cellW : usableW;
  const cellH = best ? best.cellH : usableH;

  images.forEach((img, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const innerPad = 12;
    const maxW = Math.max(1, cellW - innerPad * 2);
    const maxH = Math.max(1, cellH - innerPad * 2);

    const iw = img.width || 1;
    const ih = img.height || 1;

    const scale = Math.min(maxW / iw, maxH / ih, 1);

    img.scale(scale);

    const x0 = padding + col * (cellW + gap);
    const y0 = padding + row * (cellH + gap);

    img.set({
      left: x0 + cellW / 2,
      top: y0 + cellH / 2,
      originX: "center",
      originY: "center",
      cornerColor: "#000",
      transparentCorners: false,
      cornerSize: 8,
    });

    canvas.add(img);
  });

  if (images[images.length - 1]) {
    canvas.setActiveObject(images[images.length - 1]);
  }

  enforceTextOnTop();
  canvas.renderAll();
}

fileInput?.addEventListener("change", (e) => {
  const files = e.target.files;

  const loadPromises = Array.from(files).map((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (f) {
        fabric.Image.fromURL(f.target.result, function (img) {
          resolve(img);
        });
      };
      reader.onerror = () => resolve(null);
      reader.onabort = () => resolve(null);
      reader.readAsDataURL(file);
    });
  });

  Promise.all(loadPromises).then((imgs) => {
    layoutBatchImages(imgs.filter(Boolean));
    if (isMobileLayout()) closeSidebar();
    e.target.value = "";
    scheduleDraftSave();
  });
});

function addText() {
  const text = new fabric.IText(translations[currentLang].defaultText, {
    left: canvas.width / 2,
    top: canvas.height / 2,
    fontFamily: "DM Sans",
    fontSize: 40,
    fill: "#000000",
    fontWeight: "normal",
    fontStyle: "normal",
    underline: false,
    originX: "center",
    originY: "center",
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  enforceTextOnTop();
  canvas.renderAll();

  if (isMobileLayout()) closeSidebar();

  setTimeout(() => {
    text.enterEditing();
  }, 0);

  scheduleDraftSave();
}

function changeZIndex(direction) {
  const obj = canvas.getActiveObject();
  if (!obj) return;

  if (obj.type === "i-text" || obj.type === "text") {
    enforceTextOnTop();
    positionObjectMenu();
    return;
  }

  direction === "forward"
    ? canvas.bringForward(obj)
    : canvas.sendBackwards(obj);
  enforceTextOnTop();
  positionObjectMenu();
  scheduleDraftSave();
}

function deleteSelected() {
  const activeObjects = canvas.getActiveObjects();
  canvas.discardActiveObject();
  canvas.remove(...activeObjects);
  hideObjectMenu();
  hideColorPopup();
  hideFontPopup();
  canvas.renderAll();
  scheduleDraftSave();
}

function exportBoard() {
  placeholders.forEach((p) => p.set("visible", false));
  canvas.discardActiveObject();
  hideObjectMenu();
  hideColorPopup();
  hideFontPopup();
  canvas.renderAll();
  const dataURL = canvas.toDataURL({ format: "png", multiplier: 2 });
  const link = document.createElement("a");
  link.download = "dream-board.png";
  link.href = dataURL;
  link.click();
  placeholders.forEach((p) => p.set("visible", true));
  canvas.renderAll();

  openDonateModal();
}

// Donate modal helpers
const donateOverlay = document.getElementById("donateModalOverlay");
const donateCloseBtn = document.getElementById("donateModalCloseBtn");

function openDonateModal() {
  if (!donateOverlay) return;
  donateOverlay.style.display = "flex";
  syncBodyOverflow();
  // focus close for accessibility
  if (donateCloseBtn) donateCloseBtn.focus();
}

function closeDonateModal() {
  if (!donateOverlay) return;
  donateOverlay.style.display = "none";
  syncBodyOverflow();
}

if (donateOverlay) {
  donateOverlay.addEventListener("click", (e) => {
    if (e.target === donateOverlay) closeDonateModal();
  });
}
if (donateCloseBtn) donateCloseBtn.addEventListener("click", closeDonateModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDonateModal();
});

function hideObjectMenu() {
  objectMenu.classList.remove("is-mobile-dock");
  objectMenu.style.maxWidth = "";
  objectMenu.style.display = "none";
}

function positionObjectMenu() {
  const obj = canvas.getActiveObject();
  if (!obj) {
    hideObjectMenu();
    hideColorPopup();
    hideFontPopup();
    return;
  }

  const objType = obj.type;
  const isText = objType === "i-text" || objType === "text";
  const isImage = objType === "image";

  if (!isText && !isImage) {
    hideObjectMenu();
    hideColorPopup();
    hideFontPopup();
    return;
  }

  if (isImage) {
    omForward.style.display = "";
    omBackward.style.display = "";
    omFontFamilyBtn.style.display = "none";
    omColorBtn.style.display = "none";
    omBold.style.display = "none";
    omItalic.style.display = "none";
    omUnderline.style.display = "none";
    omCopy.style.display = "none";
    hideColorPopup();
    hideFontPopup();
  } else {
    omForward.style.display = "none";
    omBackward.style.display = "none";
    omFontFamilyBtn.style.display = "";
    omColorBtn.style.display = "";
    omBold.style.display = "";
    omItalic.style.display = "";
    omUnderline.style.display = "";
    omCopy.style.display = "";

    const ff = obj.fontFamily || "DM Sans";
    omFontFamilyLabel.textContent = ff;
    omTextColor.value = obj.fill || "#000000";

    syncTextToolStates(obj);
  }

  applyToolbarTooltips();
  objectMenu.style.display = "flex";
  objectMenu.classList.toggle("is-mobile-dock", isMobileLayout());

  const canvasRect = canvas.upperCanvasEl.getBoundingClientRect();

  objectMenu.style.left = "0px";
  objectMenu.style.top = "0px";
  objectMenu.style.maxWidth = "";
  const menuRect = objectMenu.getBoundingClientRect();

  if (isMobileLayout()) {
    const maxDockWidth = Math.max(220, Math.min(canvasRect.width - 20, 360));
    objectMenu.style.maxWidth = `${maxDockWidth}px`;

    const dockRect = objectMenu.getBoundingClientRect();
    const dockLeft = Math.max(10, (canvasRect.width - dockRect.width) / 2);
    const dockTop = Math.max(10, canvasRect.height - dockRect.height - 12);

    objectMenu.style.left = `${dockLeft}px`;
    objectMenu.style.top = `${dockTop}px`;

    positionColorPopup();
    positionFontPopup();
    return;
  }

  const rect = obj.getBoundingRect(true, true);
  const left = canvasRect.left + rect.left;
  const top = canvasRect.top + rect.top;
  const width = rect.width;
  const height = rect.height;

  const spaceAbove = top - canvasRect.top;
  const spaceBelow = canvasRect.top + canvasRect.height - (top + height);

  let menuTop;
  if (spaceAbove >= menuRect.height + 10 || spaceAbove >= spaceBelow) {
    menuTop = top - menuRect.height - 10;
  } else {
    menuTop = top + height + 10;
  }

  let menuLeft = left + width / 2 - menuRect.width / 2;
  const minLeft = canvasRect.left + 10;
  const maxLeft = canvasRect.left + canvasRect.width - menuRect.width - 10;
  menuLeft = Math.max(minLeft, Math.min(maxLeft, menuLeft));

  const minTop = canvasRect.top + 10;
  const maxTop = canvasRect.top + canvasRect.height - menuRect.height - 10;
  menuTop = Math.max(minTop, Math.min(maxTop, menuTop));

  objectMenu.style.left = menuLeft - canvasRect.left + "px";
  objectMenu.style.top = menuTop - canvasRect.top + "px";

  positionColorPopup();
  positionFontPopup();
}

omTextColor.addEventListener("input", () => {
  const obj = canvas.getActiveObject();
  if (!obj || !(obj.type === "i-text" || obj.type === "text")) return;
  obj.set("fill", omTextColor.value);
  canvas.renderAll();
  positionObjectMenu();
  scheduleDraftSave();
});

canvas.on("selection:created", positionObjectMenu);
canvas.on("selection:updated", positionObjectMenu);
canvas.on("selection:cleared", () => {
  hideObjectMenu();
  hideColorPopup();
  hideFontPopup();
});
canvas.on("object:moving", positionObjectMenu);
canvas.on("object:scaling", positionObjectMenu);
canvas.on("object:rotating", positionObjectMenu);
canvas.on("object:modified", () => {
  scheduleDraftSave();
});
canvas.on("object:added", (event) => {
  if (event.target?.isPlaceholder || suppressDraftPersistence) return;
  scheduleDraftSave();
});
canvas.on("object:removed", (event) => {
  if (event.target?.isPlaceholder || suppressDraftPersistence) return;
  scheduleDraftSave();
});
canvas.on("text:changed", () => {
  scheduleDraftSave();
});

canvas.on("mouse:down", () => {
  const obj = canvas.getActiveObject();
  if (!obj) {
    hideObjectMenu();
    hideColorPopup();
    hideFontPopup();
  }
});

window.addEventListener("keydown", (e) => {
  if (editorView.style.display !== "block") return;

  const active = canvas.getActiveObject();
  const editingText = active && active.type === "i-text" && active.isEditing;
  const modalOpen = donateOverlay && donateOverlay.style.display === "flex";

  if (
    (e.key === "Delete" || e.key === "Backspace") &&
    !editingText &&
    !modalOpen
  ) {
    deleteSelected();
  }
});

function getCanvasAreaInsets() {
  if (!canvasArea) {
    return {
      horizontal: 40,
      vertical: 40,
    };
  }

  const styles = window.getComputedStyle(canvasArea);
  const horizontal =
    (Number.parseFloat(styles.paddingLeft) || 0) +
    (Number.parseFloat(styles.paddingRight) || 0);
  const vertical =
    (Number.parseFloat(styles.paddingTop) || 0) +
    (Number.parseFloat(styles.paddingBottom) || 0);

  return {
    horizontal,
    vertical,
  };
}

function getCanvasTargetSize() {
  if (!canvasArea) {
    return {
      width: canvas.getWidth(),
      height: canvas.getHeight(),
    };
  }

  const areaRect = canvasArea.getBoundingClientRect();
  const { horizontal, vertical } = getCanvasAreaInsets();
  const fallbackWidth = canvas.getWidth() || 960;
  const fallbackHeight = canvas.getHeight() || 640;

  if (areaRect.width <= horizontal || areaRect.height <= vertical) {
    return {
      width: fallbackWidth,
      height: fallbackHeight,
    };
  }

  return {
    width: Math.max(
      isMobileLayout() ? 280 : 420,
      Math.floor(areaRect.width - horizontal),
    ),
    height: Math.max(
      isMobileLayout() ? 360 : 520,
      Math.floor(areaRect.height - vertical),
    ),
  };
}

function resizeCanvasToViewport() {
  const { width, height } = getCanvasTargetSize();

  if (canvas.getWidth() === width && canvas.getHeight() === height) {
    return;
  }

  canvas.setWidth(width);
  canvas.setHeight(height);
  canvas.calcOffset();
  createPlaceholders();
  enforceTextOnTop();
  positionObjectMenu();
}

const editorResizeObserver =
  typeof ResizeObserver === "function" && canvasArea
    ? new ResizeObserver(() => {
        if (editorView.style.display === "block") {
          resizeCanvasToViewport();
        }
      })
    : null;

if (editorResizeObserver && canvasArea) {
  editorResizeObserver.observe(canvasArea);
}

window.addEventListener("resize", () => {
  updateLandingViewportVars();
  if (!isMobileLayout()) {
    closeSidebar();
  }
  if (!editorResizeObserver && editorView.style.display === "block") {
    resizeCanvasToViewport();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    persistDraftOnExit();
  }
});

window.addEventListener("pagehide", () => {
  persistDraftOnExit();
});

// init
updateLandingViewportVars();
setLandingPhotos();
draftBootstrapPromise = bootstrapDraftState();
