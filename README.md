# ori-tablet

Tablet reading page (one sentence per page, letter+nikud units, parent marks ✓/✗).
Recording (front camera + audio) is started only by the parent and stays on the device (downloaded file); nothing is uploaded.

## Stable and beta

- **Stable**: the app at the root, https://eranlahav.github.io/ori-tablet/
- **Beta**: a full copy of the app in `beta/`, https://eranlahav.github.io/ori-tablet/beta/
- New work goes into `beta/` first. Stable changes only when beta is promoted.
- The parent settings panel (both versions) has a "גרסת האפליקציה" switch. The choice is saved in
  `localStorage["ori.channel"]` and the home-screen app opens in the chosen version.
  Escape hatch: open the address with `?stable` (or `?beta`).
- Both versions share the same saved data (localStorage `ori.t3.*`, `ori.tab.*`, IndexedDB), so beta
  must keep the data format readable by stable: only add keys or fields, never rename or reshape them.
- **Promote beta to stable**: `tools/promote-beta.sh`, then commit and open a PR. The page works out
  which version it is from its folder, so the copy needs no edits.

## Writing app (separate)

- `write/` is a separate handwriting-practice app (cursive letters, pen or finger), https://eranlahav.github.io/ori-tablet/write/
- Its own manifest (install it as a second home-screen icon) and its own saved data in `localStorage["ori.write.v1"]`.
  It never reads or writes the reading app's keys.
- Letters are hand-drawn paths in `LETTERS` (units: ceiling y=0, line y=100, pit y=150), copied from the workbook's
  stroke order. Stages: watch, trace (path + emeralds), fading model, start dot only, from memory (parent marks ✓/↺), then words.
