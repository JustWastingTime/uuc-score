# uuc-score

Compact tournament scoreboard website for UUC with JSON-driven data.

## Features
- Winner/team/point summary cards at the top.
- Search + expandable groups to avoid very long scrolling.
- Matchups loaded from `data/tournament.json` so you can update data without changing UI code.
- Ready for GitHub Pages deployment through GitHub Actions.

## Update tournament data
Edit only:

- `data/tournament.json`
- `data/tournament-data.js` (offline fallback when opening `index.html` directly)

Main fields:
- `summary.tournamentWinner`
- `summary.topTeam`
- `summary.finalPointTally`
- `summary.updatedAt`
- `groups` (all matchups)

After editing, commit and push. The site will update on the next Pages deploy.

## Run locally
Use a static server (recommended because the page fetches JSON):

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub Pages
1. Push this repository to GitHub.
2. In GitHub repo settings, enable Pages and set source to GitHub Actions.
3. Push to `main` branch; workflow publishes automatically.
