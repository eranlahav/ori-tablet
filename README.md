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
