# Claude Code Prompts

An offline, single-page reference library of 264 copy-ready prompts for working with Claude Code — organized by engineering category (onboarding, planning, implementation, debugging, testing, refactoring, git, review, docs, automation, config, and workflow).

## Structure

- `index.html` — page markup
- `styles.css` — all styles
- `data.js` — category metadata (`CATS`), prompt templates (`TPL`), and the raw prompt topics (`TOPICS`)
- `app.js` — application state, rendering, search/filter logic, favorites, prompt builder, and clipboard/export helpers

## Running locally

This is a fully static site with no build step or dependencies. Open `index.html` directly in a browser, or serve the folder with any static file server.

## Features

- Search across prompt titles, situations, tags, and prompt text
- Filter by category, experience level (Beginner/Pro), and tag
- Favorite prompts (persisted in `localStorage`)
- Prompt Builder: layer your own context, constraints, and definition of done onto any prompt
- Copy individual prompts, copy all visible prompts as Markdown, or export favorites as JSON
- Light/dark theme toggle (persisted in `localStorage`)
- Keyboard shortcuts: `/` to focus search, `Esc` to clear filters
