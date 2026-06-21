const groupsContainer = document.getElementById("groupsContainer");
const searchInput = document.getElementById("searchInput");
const expandAllBtn = document.getElementById("expandAllBtn");
const winnerValue = document.getElementById("winnerValue");
const teamValue = document.getElementById("teamValue");
const pointsValue = document.getElementById("pointsValue");
const updatedAtValue = document.getElementById("updatedAt");

let tournament = null;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlight(text, query) {
  if (!query.trim()) return escapeHtml(text);

  const safeText = escapeHtml(text);
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeQuery})`, "ig");
  return safeText.replace(regex, "<mark>$1</mark>");
}

function raceEntryToText(entry) {
  return `${entry[0]} - ${entry[1]} (${entry[2]})`;
}

function renderClub(clubName, races, query) {
  const categories = ["Sprint", "Mile", "Medium", "Long"];
  const renderedCats = categories
    .map((cat) => {
      const entries = races[cat] || [];
      const filtered = entries.filter((entry) =>
        raceEntryToText(entry).toLowerCase().includes(query)
      );
      if (query && filtered.length === 0) return "";
      const source = query ? filtered : entries;
      const list = source
        .map((entry) => `<li>${highlight(raceEntryToText(entry), query)}</li>`)
        .join("");
      return `<article class="cat"><h4>${cat}</h4><ul>${list}</ul></article>`;
    })
    .join("");

  if (!renderedCats) return "";
  return `<section class="club"><h3>${escapeHtml(clubName)}</h3><div class="cat-grid">${renderedCats}</div></section>`;
}

function renderGroups(query = "") {
  const needle = query.trim().toLowerCase();
  if (!tournament) return;

  const items = tournament.groups
    .map((group) => {
      const clubBlocks = Object.entries(group.clubs)
        .map(([clubName, races]) => renderClub(clubName, races, needle))
        .filter(Boolean)
        .join("");

      if (needle && !clubBlocks) return "";
      const clubCount = Object.keys(group.clubs).length;
      return `
      <details class="group" ${needle ? "open" : ""}>
        <summary>
          <span class="group-title">${escapeHtml(group.name)}</span>
          <span class="group-count">${clubCount} club${clubCount > 1 ? "s" : ""}</span>
        </summary>
        ${clubBlocks}
      </details>
    `;
    })
    .join("");

  groupsContainer.innerHTML =
    items ||
    `<p class="muted">No matchups found. Try another keyword.</p>`;
}

searchInput.addEventListener("input", (event) => {
  renderGroups(event.target.value);
});

expandAllBtn.addEventListener("click", () => {
  const details = groupsContainer.querySelectorAll("details.group");
  const shouldExpand = expandAllBtn.textContent === "Expand All";
  details.forEach((element) => {
    element.open = shouldExpand;
  });
  expandAllBtn.textContent = shouldExpand ? "Collapse All" : "Expand All";
});

async function loadTournament() {
  try {
    const response = await fetch("./data/tournament.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("JSON request failed");
    }
    tournament = await response.json();
  } catch (_error) {
    if (window.TOURNAMENT_DATA) {
      tournament = window.TOURNAMENT_DATA;
    } else {
      throw _error;
    }
  }

  winnerValue.textContent = tournament.summary.tournamentWinner;
  teamValue.textContent = tournament.summary.topTeam;
  pointsValue.textContent = tournament.summary.finalPointTally;
  updatedAtValue.textContent = `Last updated: ${tournament.summary.updatedAt}`;

  renderGroups();
}

loadTournament().catch(() => {
  groupsContainer.innerHTML =
    '<p class="muted">Failed to load data. Run a local server or verify `data/tournament.json`.</p>';
});
