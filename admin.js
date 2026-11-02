// Offline/browser-only character editor.
// Changes are saved in localStorage on THIS browser and do not sync to other devices.
(() => {
  const $ = id => document.getElementById(id);
  const authLayer = $("staffAuth"), editorLayer = $("staffEditor"), contextMenu = $("staffContextMenu");
  const setting = window.BULLSHIT_LOCAL_EDIT || {};
  let unlocked = false, selected = null, selectedType = null;
  const STORAGE_KEY = "bullshit-project-character-edits-v1";

  function message(text) { $("staffAuthStatus").textContent = text; }
  function show(layer) { layer.classList.add("open"); layer.setAttribute("aria-hidden","false"); }
  function hide(layer) { layer.classList.remove("open"); layer.setAttribute("aria-hidden","true"); }

  function idFor(type, item) {
    return type + ":" + item[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function readEdits() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"survivors":{},"killers":{},"removed":{"survivors":[],"killers":[]}}'); }
    catch { return {survivors:{},killers:{},removed:{survivors:[],killers:[]}}; }
  }
  function saveEdits(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function applyEdits() {
    const data = readEdits();
    ["survivors","killers"].forEach(type => {
      const base = window.DBD_CHARACTERS[type] || [];
      const removed = new Set(data.removed[type] || []);
      window.DBD_CHARACTERS[type] = base
        .filter(item => !removed.has(idFor(type,item)))
        .map(item => data[type][idFor(type,item)] || item);
    });
    window.DBD_PORTRAITS = {};
    ["survivors","killers"].forEach(type => {
      Object.values(data[type] || {}).forEach(entry => {
        if (entry.portrait_url && entry.payload?.[0]) window.DBD_PORTRAITS[entry.payload[0]] = entry.portrait_url;
      });
    });
    window.dispatchEvent(new CustomEvent("dbd-archive-updated"));
  }

  $("staffSignIn")?.addEventListener("click", () => {
    show(authLayer);
    $("staffEmail").value = "";
    $("staffEmail").placeholder = "Passcode";
    $("staffEmail").type = "password";
    $("staffPassword").style.display = "none";
    $("staffAuthTitle").innerHTML = "EDIT <em>MODE</em>";
    message("Enter the local edit passcode.");
  });
  $("staffAuthClose")?.addEventListener("click", () => hide(authLayer));
  $("staffLogin")?.addEventListener("click", () => {
    const entered = $("staffEmail").value;
    if (!setting.passcode || setting.passcode === "change-this-passcode") {
      return message("First change the passcode in local-edit-config.js.");
    }
    if (entered !== setting.passcode) return message("Incorrect passcode.");
    unlocked = true;
    $("staffLogout").hidden = false;
    $("adminHint").style.display = "none";
    refreshCards();
    hide(authLayer);
  });
  $("staffLogout")?.addEventListener("click", () => {
    unlocked = false;
    $("staffLogout").hidden = true;
    refreshCards();
  });

  function refreshCards() {
    document.querySelectorAll(".character-card").forEach(card => card.classList.toggle("staff-manageable", unlocked));
    $("adminHint").style.display = unlocked ? "none" : "";
  }

  document.addEventListener("contextmenu", event => {
    const card = event.target.closest(".character-card");
    if (!card || !unlocked) return;
    event.preventDefault();
    openMenu(card, event.clientX, event.clientY);
  });
  let holdTimer = null;
  document.addEventListener("pointerdown", event => {
    const card = event.target.closest(".character-card");
    if (!card || !unlocked) return;
    holdTimer = setTimeout(() => openMenu(card, Math.min(event.clientX, innerWidth - 235), Math.min(event.clientY, innerHeight - 220)), 600);
  });
  ["pointerup","pointercancel","pointermove"].forEach(name => document.addEventListener(name, () => clearTimeout(holdTimer)));

  function openMenu(card, x, y) {
    selectedType = document.querySelector(".directory-tab.active")?.dataset.type || "survivors";
    selected = window.DBD_CHARACTERS[selectedType][Number(card.dataset.index)];
    if (!selected) return;
    $("staffContextTitle").textContent = selected[0].toUpperCase();
    contextMenu.style.left = Math.max(8, Math.min(x, innerWidth - 230)) + "px";
    contextMenu.style.top = Math.max(8, Math.min(y, innerHeight - 220)) + "px";
    show(contextMenu);
  }

  contextMenu.querySelectorAll("[data-staff-action]").forEach(button => button.addEventListener("click", () => {
    const action = button.dataset.staffAction;
    hide(contextMenu);
    if (!selected || !unlocked || action === "cancel") return;
    if (action === "remove") {
      if (!confirm("Remove " + selected[0] + " from this browser's saved website view?")) return;
      const data = readEdits();
      const id = idFor(selectedType, selected);
      data.removed[selectedType] = [...new Set([...(data.removed[selectedType] || []), id])];
      saveEdits(data);
      applyEdits();
      return;
    }
    openEditor(action);
  }));

  function openEditor(action) {
    const survivor = selectedType === "survivors";
    const labels = survivor
      ? ["Name","Difficulty","Unique perks","Playstyle","Background","Playstyle and perk overview","Origin / license"]
      : ["Name","Alias","Difficulty","Power name","Power description","Additional description","Teachable perks","Origin / license"];
    const fields = $("staffEditorFields");
    if (action === "image") {
      fields.innerHTML = `<div class="staff-editor-field"><label for="staffPortraitUrl">PORTRAIT IMAGE URL</label><input id="staffPortraitUrl" type="url" placeholder="https://..."><p class="staff-editor-note">Use a public image URL.</p></div>`;
      $("staffEditorTitle").innerHTML = "CHANGE <em>PORTRAIT</em>";
    } else {
      fields.innerHTML = labels.map((label, i) => {
        const value = selected[i] ?? "";
        const long = [4,5].includes(i);
        return `<div class="staff-editor-field"><label for="staffField${i}">${label.toUpperCase()}</label>${long
          ? `<textarea id="staffField${i}" data-field="${i}">${escapeHtml(value)}</textarea>`
          : `<input id="staffField${i}" data-field="${i}" value="${escapeHtml(value)}">`}</div>`;
      }).join("");
      $("staffEditorTitle").innerHTML = "EDIT <em>PROFILE</em>";
    }
    show(editorLayer);
  }

  $("staffEditorClose").addEventListener("click", () => hide(editorLayer));
  $("staffEditorCancel").addEventListener("click", () => hide(editorLayer));
  $("staffEditorForm").addEventListener("submit", event => {
    event.preventDefault();
    if (!selected || !unlocked) return;
    const data = readEdits(), id = idFor(selectedType, selected);
    const existing = data[selectedType][id] || {payload:[...selected], portrait_url:null};
    const portraitInput = $("staffPortraitUrl");
    if (portraitInput) {
      const portrait = portraitInput.value.trim();
      if (!/^https?:\/\//i.test(portrait)) return $("staffEditorStatus").textContent = "Enter an image URL beginning with https:// or http://.";
      existing.portrait_url = portrait;
    } else {
      $("staffEditorFields").querySelectorAll("[data-field]").forEach(input => { existing.payload[Number(input.dataset.field)] = input.value.trim(); });
    }
    data[selectedType][id] = existing;
    data.removed[selectedType] = (data.removed[selectedType] || []).filter(itemId => itemId !== id);
    saveEdits(data);
    applyEdits();
    hide(editorLayer);
  });

  applyEdits();
  refreshCards();
  window.addEventListener("dbd-archive-updated", () => {
    const active = document.querySelector(".directory-tab.active")?.dataset.type || "survivors";
    document.querySelector(`[data-type="${active}"]`)?.click();
    refreshCards();
  });
})();
