// -----------------------
//  MODAL
// -----------------------
const modal = document.getElementById("modal-overlay");
const openBtn = document.getElementById("open-modal");
const closeBtn = document.getElementById("close-modal");

function openModal() {
  modal.classList.add("modal--active");
}

function closeModal() {
  modal.classList.remove("modal--active");
}

openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// -----------------------
//  FINGERPRINT
// -----------------------
async function getBrowserFingerprint() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl");
  const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");

  const data = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    "touch:" + ("ontouchstart" in window),
    "localStorage:" + !!window.localStorage,
    "sessionStorage:" + !!window.sessionStorage,
    navigator.plugins
      ? Array.from(navigator.plugins)
          .map((p) => p.name)
          .join(",")
      : "no-plugins",
    gl ? gl.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL) : "no-webgl",
    gl ? gl.getParameter(debugInfo?.UNMASKED_VENDOR_WEBGL) : "no-webgl",
  ].join("||");

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(data),
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// -----------------------
//  USER ID SYNC
// -----------------------
async function getUserId() {
  const storage = await chrome.storage.local.get(["userId"]);
  let id = storage.userId;

  if (!id) {
    id = await getBrowserFingerprint();
    await chrome.storage.local.set({ userId: id });
  }

  localStorage.setItem("userId", id);
  return id;
}

// -----------------------
//  SITE LIST STATE
// -----------------------
let sites = [];

// Заглушка API
async function fakeApiAddSite(site) {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ ok: true, id: Date.now() }), 300),
  );
}

async function fakeApiDeleteSite(id) {
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 200));
}

// -----------------------
//  RENDERING
// -----------------------
const siteListEl = document.querySelector(".site-list");

function renderSites() {
  siteListEl.innerHTML = "";

  sites.forEach((s) => {
    const li = document.createElement("li");
    li.className = "site-item";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.padding = "0.5rem 0";

    const span = document.createElement("span");
    span.textContent = s.full;

    const delBtn = document.createElement("button");
    delBtn.textContent = "×";
    delBtn.style.border = "none";
    delBtn.style.background = "transparent";
    delBtn.style.fontSize = "1.25rem";
    delBtn.style.cursor = "pointer";
    delBtn.style.color = "#64748b";

    delBtn.onclick = async () => {
      const res = await fakeApiDeleteSite(s.id);
      if (!res.ok) return alert("Ошибка удаления");

      sites = sites.filter((x) => x.id !== s.id);
      await chrome.storage.local.set({ sites });
      renderSites();
    };

    li.appendChild(span);
    li.appendChild(delBtn);
    siteListEl.appendChild(li);
  });
}

// -----------------------
//  ADD SITE
// -----------------------
const addForm = document.getElementById("add-site-form");

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const protocol = document.getElementById("protocol").value;
  const site = document.getElementById("site-address").value.trim();

  if (!site) return alert("Введите адрес сайта");

  const full = `${protocol}://${site}`;

  const res = await fakeApiAddSite(full);
  if (!res.ok) return alert("Ошибка при добавлении");

  const newSite = { id: res.id, protocol, site, full };
  sites.push(newSite);

  await chrome.storage.local.set({ sites });

  renderSites();
  closeModal();
  addForm.reset();
});

// -----------------------
//  INIT
// -----------------------
(async function init() {
  const userId = await getUserId();
  console.log("UserID:", userId);

  const storage = await chrome.storage.local.get(["sites"]);
  sites = storage.sites || [];

  renderSites();
})();
