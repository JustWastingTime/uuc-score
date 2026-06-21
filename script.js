const matchupsContainer = document.getElementById("matchupsContainer");

let tournament = null;
const categories = ["Sprint", "Mile", "Medium", "Long"];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function raceEntryToText(entry) {
  return `${entry[0]} - ${entry[1]} (${entry[2]})`;
}

function findPairResults(results, teamA, teamB) {
  return (
    results[`${teamA}__vs__${teamB}`] ||
    results[`${teamB}__vs__${teamA}`] ||
    {}
  );
}

function teamOfTrainer(club, category, trainerName) {
  const entries = (club && club[category]) || [];
  return entries.some(
    (entry) => String(entry[0]).toLowerCase() === trainerName.toLowerCase()
  );
}

function getCategoryResult(group, teamA, teamB, category) {
  const results = group.results || {};
  const pairResults = findPairResults(results, teamA, teamB);
  const winnerTrainer = pairResults[category] || "";
  if (!winnerTrainer) return { winnerTrainer: "", winnerTeam: "" };

  if (teamOfTrainer(group.clubs[teamA], category, winnerTrainer)) {
    return { winnerTrainer, winnerTeam: teamA };
  }
  if (teamOfTrainer(group.clubs[teamB], category, winnerTrainer)) {
    return { winnerTrainer, winnerTeam: teamB };
  }
  return { winnerTrainer, winnerTeam: "" };
}

function scorePair(group, teamA, teamB) {
  let scoreA = 0;
  let scoreB = 0;
  categories.forEach((category) => {
    const { winnerTeam } = getCategoryResult(group, teamA, teamB, category);
    if (winnerTeam === teamA) scoreA += 1;
    if (winnerTeam === teamB) scoreB += 1;
  });
  return { scoreA, scoreB };
}

function renderLineup(entries, winnerTrainer) {
  if (!entries || entries.length === 0) {
    return '<li class="lineup-item lineup-item--empty">No entry</li>';
  }
  return entries
    .map((entry) => {
      const isWinner =
        winnerTrainer &&
        String(entry[0]).toLowerCase() === winnerTrainer.toLowerCase();
      const cls = isWinner ? "lineup-item lineup-item--won" : "lineup-item";
      const crown = isWinner ? '<span class="crown" title="Match winner">&#128081;</span> ' : "";
      return `<li class="${cls}">${crown}${escapeHtml(raceEntryToText(entry))}</li>`;
    })
    .join("");
}

function winnerText(winnerTeam) {
  if (winnerTeam) return `Winner: ${winnerTeam}`;
  return "Winner: Pending";
}

function renderPair(group, teamA, teamB) {
  const { scoreA, scoreB } = scorePair(group, teamA, teamB);
  const clubA = group.clubs[teamA];
  const clubB = group.clubs[teamB];
  const rows = categories
    .map((category) => {
      const { winnerTrainer, winnerTeam } = getCategoryResult(group, teamA, teamB, category);
      const leftClass =
        winnerTeam === teamA
          ? "lineup lineup--winner"
          : winnerTeam
            ? "lineup lineup--loser"
            : "lineup";
      const rightClass =
        winnerTeam === teamB
          ? "lineup lineup--winner"
          : winnerTeam
            ? "lineup lineup--loser"
            : "lineup";

      return `
        <div class="duel-row">
          <section class="${leftClass}">
            <h4 class="lineup-title">${escapeHtml(teamA)}</h4>
            <ul class="lineup-list">${renderLineup(clubA[category], winnerTrainer)}</ul>
          </section>
          <section class="duel-center">
            <span class="category-tag">${category}</span>
            <span class="duel-winner">${escapeHtml(winnerText(winnerTeam))}</span>
          </section>
          <section class="${rightClass}">
            <h4 class="lineup-title">${escapeHtml(teamB)}</h4>
            <ul class="lineup-list">${renderLineup(clubB[category], winnerTrainer)}</ul>
          </section>
        </div>
      `;
    })
    .join("");

  return `
    <article class="pair-card">
      <div class="pair-head">
        <div class="pair-title">${escapeHtml(teamA)} vs ${escapeHtml(teamB)}</div>
        <div class="pair-score">${escapeHtml(teamA)} ${scoreA} : ${scoreB} ${escapeHtml(teamB)}</div>
      </div>
      ${rows}
    </article>
  `;
}

function renderMatchups() {
  if (!tournament) return;

  const html = tournament.groups
    .map((group) => {
      const teams = Object.keys(group.clubs);
      const pairs = [];
      for (let i = 0; i < teams.length; i += 1) {
        for (let j = i + 1; j < teams.length; j += 1) {
          const teamA = teams[i];
          const teamB = teams[j];
          pairs.push(renderPair(group, teamA, teamB));
        }
      }
      return `
        <details class="group">
          <summary>
            <span class="group-title">${escapeHtml(group.name)}</span>
            <span class="group-count">${pairs.length} team matchup${pairs.length > 1 ? "s" : ""}</span>
          </summary>
          <div class="club">${pairs.join("")}</div>
        </details>
      `;
    })
    .join("");

  matchupsContainer.innerHTML = html;
}

if (window.TOURNAMENT_DATA) {
  tournament = window.TOURNAMENT_DATA;
  renderMatchups();
} else {
  matchupsContainer.innerHTML =
    '<p class="muted">Failed to load data. Check `data/tournament-data.js`.</p>';
}
