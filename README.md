# Campus Suite (Next.js + React + TypeScript)

University-focused calculator workspace built with Next.js App Router, React, and TypeScript.

## Features

- University course grade calculator (custom rules)
  - `RegTerm = (RegMid + RegEnd) / 2`
  - `Total = 0.6 * RegTerm + 0.4 * Final`
  - Live letter-grade detection from total (`A` ... `F`, including `FX`)
  - Course retake rule: if `RegMid < 25` and `RegTerm < 25`
  - FX rule: if `25 < Final < 50`
  - Not passed rule: if `Final <= 25`
  - Scholarship thresholds:
    - `Total >= 70` (scholarship)
    - `Total >= 90` (high scholarship)
- Scientific calculator
- GPA calculator
- Final exam target calculator
- Syllabus builder (multiple courses, custom sections, weighted auto-calculation)
- Fully redesigned page-based interface with shared navigation shell

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

With nodemon:

```bash
npm run dev:nodemon
```

Page-based routes:
- `/course-grade`
- `/syllabus`
- `/scientific`
- `/gpa`
- `/final-target`

`/` redirects to `/course-grade`.

Legacy static implementation is preserved in `legacy/`.

## Build for production

```bash
npm run build
npm run start
```
