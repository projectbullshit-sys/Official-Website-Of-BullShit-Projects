// Replace these placeholder URLs with the community's real invite and service links.
const LINKS = {
  discord: "https://discord.gg/bullshitprojectdbdm",
  appeals: "https://discord.gg/rPTGXgVXKD",
  kofi: "https://ko-fi.com/turbodarkow",
  telegram: "https://t.me/bsprojapp"
};

document.getElementById("discordLink").href = LINKS.discord;
const appealsLink = document.getElementById("appealsLink");
if (LINKS.appeals) appealsLink.href = LINKS.appeals;

document.querySelectorAll("[data-placeholder]").forEach(link => {
  const key = link.dataset.placeholder;
  if (LINKS[key]) {
    link.href = LINKS[key];
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = link.textContent.replace("ADD ", "OPEN ").replace(" LINK", "");
  } else {
    link.addEventListener("click", event => {
      event.preventDefault();
      alert("This link has not been configured yet. Add the real URL in script.js.");
    });
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "✕" : "☰";
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

// Character directory: cards open an accessible, searchable profile modal.
(() => {
  const data = window.DBD_CHARACTERS;
  if (!data) return;
  const grid = document.getElementById('characterGrid');
  const search = document.getElementById('characterSearch');
  const tabs = [...document.querySelectorAll('.directory-tab')];
  const modal = document.getElementById('characterModal');
  let activeType = 'survivors';
  let lastFocused = null;

  document.getElementById('survivorCount').textContent = `(${data.survivors.length})`;
  document.getElementById('killerCount').textContent = `(${data.killers.length})`;

  const imageSlug = name => name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const imageUrl = name => { const custom = window.DBD_PORTRAITS?.[name]; return custom || `https://deadbydaylight.fandom.com/wiki/Special:FilePath/${encodeURIComponent('CharPortrait_' + imageSlug(name) + '.png')}?width=520`; };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function render() {
    const query = search.value.trim().toLowerCase();
    const list = data[activeType].filter(item => item.join(' ').toLowerCase().includes(query));
    grid.innerHTML = list.length ? list.map((item, index) => {
      const name = activeType === 'survivors' ? item[0] : item[0];
      const alias = activeType === 'survivors' ? item[3] : item[1];
      const portraitName = activeType === 'survivors' ? name : name;
      const initials = name.replace(/^The /,'').split(/\s+/).slice(0,2).map(part => part[0]).join('');
      return `<button class="character-card" type="button" data-index="${data[activeType].indexOf(item)}" aria-label="Open ${escapeHtml(name)} profile">
        <div class="character-art"><span class="character-monogram">${escapeHtml(initials)}</span><img loading="lazy" src="${imageUrl(portraitName)}" alt="${escapeHtml(name)} character portrait" onerror="this.remove()"></div>
        <div class="character-card-copy"><small>${activeType === 'survivors' ? 'SURVIVOR' : 'KILLER'} · ${escapeHtml(activeType === 'survivors' ? item[1] : item[2])} DIFFICULTY</small><strong>${escapeHtml(name)}</strong><span>${escapeHtml(alias)}</span></div>
      </button>`;
    }).join('') : '<div class="directory-empty">No characters match that search. Try another name, perk, or ability.</div>';
    grid.querySelectorAll('.character-card').forEach(card => card.addEventListener('click', () => openProfile(data[activeType][Number(card.dataset.index)])));
  }

  function openProfile(item) {
    lastFocused = document.activeElement;
    const isSurvivor = activeType === 'survivors';
    const name = item[0];
    const alias = isSurvivor ? item[3] : item[1];
    const difficulty = isSurvivor ? item[1] : item[2];
    const abilityName = isSurvivor ? 'PLAYSTYLE & PERK OVERVIEW' : `POWER · ${item[3]}`;
    const ability = isSurvivor ? item[5] : item[5];
    const perks = isSurvivor ? item[2] : item[6];
    const origin = isSurvivor ? item[6] : item[7];
    const portrait = imageUrl(name);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.querySelector('.modal-panel').classList.toggle('killer', !isSurvivor);
    document.getElementById('modalRole').textContent = isSurvivor ? 'SURVIVOR PROFILE' : 'KILLER PROFILE';
    document.getElementById('modalSubtitle').textContent = isSurvivor ? 'THE ONES WHO FIGHT TO ESCAPE' : 'THE ONES WHO HUNT IN THE FOG';
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalAlias').textContent = alias;
    document.getElementById('modalMeta').innerHTML = `<span>${isSurvivor ? 'SURVIVOR' : 'KILLER'}</span><span>${escapeHtml(difficulty)} DIFFICULTY</span><span>${escapeHtml(origin)}</span>`;
    document.getElementById('modalBio').textContent = isSurvivor ? item[4] : `${item[1]} · ${item[4]}`;
    document.getElementById('abilityHeading').textContent = abilityName;
    document.getElementById('modalAbility').textContent = ability;
    document.getElementById('perkHeading').textContent = isSurvivor ? 'UNIQUE PERKS' : 'TEACHABLE PERKS';
    document.getElementById('modalPerks').innerHTML = perks.split(' · ').map(perk => `<span>${escapeHtml(perk)}</span>`).join('');
    document.getElementById('modalOrigin').textContent = `ORIGIN / LICENSE: ${origin} · Character descriptions are concise fan-reference summaries.`;
    const portraitPanel = document.getElementById('modalPortrait');
    portraitPanel.style.backgroundImage = `linear-gradient(0deg,#09090d66,#09090d22),url("${portrait}")`;
    portraitPanel.style.backgroundSize = 'cover';
    portraitPanel.style.backgroundPosition = 'center 25%';
    document.querySelector('.modal-close').focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    activeType = tab.dataset.type;
    tabs.forEach(button => {
      const selected = button === tab;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    render();
  }));
  search.addEventListener('input', render);
  modal.querySelectorAll('[data-close-modal]').forEach(element => element.addEventListener('click', closeModal));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
  render();
  window.addEventListener("dbd-archive-updated", render);
})();
