# Mobile Responsiveness Plan

All time estimates are AI implementation time (you review and approve, no coding needed from you).

---

## Phase 1 — Core quiz usable on mobile (~30 min)

The quiz loop is the most important screen. These fixes make the app functional on a 375px iPhone.

### QuizCard.tsx
- Prompt word: `text-4xl sm:text-5xl` → `text-2xl sm:text-4xl` + add `break-words` (long Finnish words overflow)
- Submit button: replace `py-6 px-12 min-w-[200px]` with `w-full sm:min-w-[200px]`
- Answer input: `text-2xl` → `text-xl sm:text-2xl`
- Card padding: `p-8 sm:p-12` → `p-4 sm:p-8 sm:p-12`

### PracticeCard.tsx
- Correct answer display: `text-4xl sm:text-5xl` → `text-2xl sm:text-4xl` + `break-words`
- Submit button: `min-w-[180px]` → `w-full sm:min-w-[180px]`
- Answer input: `text-2xl` → `text-xl sm:text-2xl`
- Card padding: `p-8 sm:p-12` → `p-4 sm:p-8 sm:p-12`

---

## Phase 2 — Start and results screens (~30 min)

### page.tsx (home / start screen)
- Hero title: `text-5xl` → `text-3xl sm:text-5xl`
- Hero subtitle: `text-2xl` → `text-xl sm:text-2xl`
- Input mode buttons: `min-w-[240px]` → `w-full sm:min-w-[240px]`, `text-xl` → `text-lg sm:text-xl`
- Start Quiz button: `min-w-[280px]` → `w-full sm:min-w-[280px]`, `text-2xl` → `text-xl sm:text-2xl`
- Language selector: add `pt-12 sm:pt-0` to hero so it doesn't overlap the absolute-positioned selector

### ResultsCard.tsx
- Card padding: `p-8 sm:p-12` → `p-4 sm:p-8 sm:p-12`
- Trophy row: add `flex-wrap` so "🏆 New Record! 🏆" doesn't overflow
- Words-not-first-try list: add `min-w-0 truncate` to word/translation spans

---

## Phase 3 — Polish (~45 min)

### ProgressHeader.tsx
- Stat text: `text-lg` → `text-base sm:text-lg` on all three items
- Gap: `gap-6 sm:gap-8` → `gap-3 sm:gap-6 sm:gap-8`
- Add `w-full` to the container div

### LanguageSelector.tsx
- Add `min-h-[44px]` to the `<select>` element (touch target too small at ~38px)
- Hide the label on mobile: `hidden sm:inline` on the label text

### WordListUpload.tsx
- Hide the "Drag and drop" instruction on touch devices: `hidden sm:block` (drag doesn't work on mobile)
- Show a simpler "Tap to choose a file" message on mobile instead
- Word preview spans: add `min-w-0 truncate` to prevent long words from breaking layout

---

## Phase 4 — Manual entry table (~45 min)

This is the most work because a horizontal-scroll table is a poor experience on mobile.

### ManualEntryTable.tsx — current behaviour
The table has `min-w-[400px]` so it always scrolls horizontally on a 375px screen. It works, but feels unnatural on touch.

### Proposed approach
Replace the table with a **stacked card layout on mobile**, keeping the table on desktop:
- On mobile (`< sm`): each row becomes a compact card with two labeled inputs stacked vertically
- On desktop (`sm+`): keep the existing table layout unchanged
- Tab/Enter keyboard navigation stays the same
- No change to the underlying data model or localStorage

This is the only structural rework in the whole plan — everything else is CSS class adjustments.

---

## Summary

| Phase | What | Time |
|---|---|---|
| 1 | Quiz screens usable on mobile | ~30 min |
| 2 | Start + results screens | ~30 min |
| 3 | Polish (header, selector, upload) | ~45 min |
| 4 | Manual entry table rework | ~45 min |
| **Total** | | **~2.5 hours** |

Phases 1–3 can be done independently of Phase 4. If you want a quick win, Phase 1 alone makes the core experience work on mobile in half an hour.
