# ucc-score

Compact tournament scoreboard website for UCC with JSON-driven data.

## Features
- Winner/team/point summary cards at the top.
- Search + expandable groups to avoid very long scrolling.
- Matchups loaded from `data/tournament.json` so you can update data without changing UI code.
- Ready for GitHub Pages deployment through GitHub Actions.

## Update tournament data
There is **one** data file to edit:

- `data/tournament-data.js`

It works whether you open `index.html` directly or host it online, so there is
no second file to keep in sync.

### Recording results

Each group has a `results` object keyed by a team pair. The two team names are
joined with `__vs__`, for example `"Avalon Racing__vs__Cabal Agency"`. Order
does not matter — `"Cabal Agency__vs__Avalon Racing"` works too.

For each category (`Sprint`, `Mile`, `Medium`, `Long`), set the **name of the
single winning trainer**. That's it:

```js
"Avalon Racing__vs__Cabal Agency": { "Sprint": "Nekata", "Mile": "WildCat", "Medium": "DualFreezor", "Long": "Snailz" }
```

The site automatically:
- finds which team that trainer belongs to,
- gives the trainer a crown and highlights their team's side,
- adds 1 point to that team in the score (e.g. `2 : 2`).

Use the trainer name exactly as it appears (the first value in each lineup
entry). Leave a category empty `""` to show it as Pending.

After editing, commit and push. The site will update on the next Pages deploy.

## Run locally
Just open `index.html` in your browser. No server needed.

## Deploy to GitHub Pages
1. Push this repository to GitHub.
2. In GitHub repo settings, enable Pages and set source to GitHub Actions.
3. Push to `main` branch; workflow publishes automatically.
