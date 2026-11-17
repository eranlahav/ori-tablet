# ori-tablet

Tablet reading page (one sentence per page, letter+nikud units, parent marks ✓/✗).
Recording (front camera + audio) is started only by the parent and stays on the device (downloaded file); nothing is uploaded.

## Cues
Parent panel → "בחירת רמזים": for every letter, final letter (ך ם ן ף ץ), ב/כ/פ without a dagesh and vowel sound, Ori picks one of up to 4 cues
(teacher's cue is the default). Saved in localStorage `ori.t3.cueChoice`. Cue pictures: `node art/cues.js` writes `art/cues/*.svg`.
Tapping a cue while reading plays the parent's recording of that sound (recorded in the same picker, kept in IndexedDB `ori-cue-sounds`
on that tablet only); without a recording it shows a short explanation of the sound.
