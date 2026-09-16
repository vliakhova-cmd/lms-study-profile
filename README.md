# lms-study-profile — the study level

The study's own screen: General Info, its Sites listing, the Training Library
with AI course authoring and suggested Site & Roles mapping, Training Plans,
and the Delegated Tasks that join the study's duties to the courses that
qualify them.

```bash
npm install
npm run dev      # http://localhost:5176
```

**Live:** https://vliakhova-cmd.github.io/lms-study-profile/

What the study owns is the catalogue, the duty → course mapping and the list
of sites. Clicking a site name opens the **site** app; a person named in the
Training Gaps dialog opens the **user** app.

## How the levels connect

A study, a site and a user are three apps in three repositories. Moving
between them is a navigation, not a route change — each level owns its data
and its URL:

| Level | Repository | Opened with |
| --- | --- | --- |
| Study | [lms-study-profile](https://github.com/vliakhova-cmd/lms-study-profile) | `?section=` |
| Site | [lms-site-profile](https://github.com/vliakhova-cmd/lms-site-profile) | `?site=<number>&section=` |
| User | [lms-user-profile](https://github.com/vliakhova-cmd/lms-user-profile) | `?site=<number>&user=<name>&section=` |

Two more apps sit beside them, linked the same way:
[doa-log](https://github.com/vliakhova-cmd/doa-log-report) holds the signed
DOA logs the tasks are read from, and
[ai-course-authoring-flow](https://github.com/vliakhova-cmd/ai-course-authoring-flow)
writes the courses.

`src/links.ts` is where every one of those URLs is built — dev-server ports
locally, sibling Pages sites once published.

## Conventions

- **Inline styles only.** No Tailwind, no CSS modules.
- **`src/tokens.ts` is the single source of DS values**, each entry commented
  with the Figma variable it comes from. Components read tokens, never literals.
- Components come from **DS Base 2.0** and **DS Advanced 2.0**.
- A DS `icon-size` token is the **container**; the glyph inside it is smaller
  (a 30px box holds a 20px glyph, a 20px box holds a 15px one).
