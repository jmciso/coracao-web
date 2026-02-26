# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Casa Coracao is a spiritual wellness center website. The repo contains two independent sub-projects:

- **coracao-web/** — Static site built with Astro.js v5.18, Tailwind CSS v4, and Directus SDK v21 (on `migration/v5` branch)
- **coracao-web/** (master branch) — Legacy site: Astro v1.6.14, Tailwind v3, Directus SDK v10
- **coracao-cms/** — Directus headless CMS running on Docker Compose with PostgreSQL
- **cms-bkp/** — CMS backup (Directus v9.23.1 snapshot from 2024-09-29)

Content (articles, events) is managed in Directus and fetched at build time to generate static HTML.

## Active Migration

The site is being migrated from legacy to latest versions. See `CMS-MIGRATION-GUIDE.md` for the Directus migration plan.

| Component | Legacy (master) | Migrated (migration/v5) |
|-----------|----------------|------------------------|
| Astro | 1.6.14 | 5.18.0 |
| Directus SDK | 10.3.1 | 21.1.0 |
| Tailwind CSS | 3.2.4 | 4.2.1 |
| Node.js | any | 22+ required (.nvmrc) |
| Directus CMS | 9.23.1 | 11.5.0 (pending) |

## Commands

All commands run from `coracao-web/`:

```bash
npm run dev        # Start dev server
npm run build      # Build static site to dist/
npm run preview    # Preview production build locally
```

CMS (from `cms-bkp/` or `coracao-cms/`):

```bash
docker compose up -d      # Start PostgreSQL + Directus (port 8055)
docker compose down        # Stop services
```

Mock Directus (no Docker needed, for build testing):
```bash
node test/mock-directus.mjs   # Serves on http://localhost:8055
```

There is no linting, formatting, or test framework configured.

## Environment Variables

`coracao-web/.env`:
- `PUBLIC_API_URL` — Directus instance URL (e.g. `http://localhost:8055/`)
- `DIRECTUS_STATIC_TOKEN` — Static token for read-only API access
- Alternative: `DIRECTUS_EMAIL` + `DIRECTUS_PASSWORD` for email/password auth

`PUBLIC_*` variables are exposed to client-side code (Astro convention).

## Architecture

### Data Flow

Astro pages use `getStaticPaths()` to fetch content from Directus at build time. All pages are statically generated (no SSR). The Directus client is initialized in `src/utils/utils.ts` which also provides `formatDate()` (pt-PT locale) and `getAssetURL()`.

### Routing

File-based routing in `src/pages/`. Dynamic routes use `[slug].astro` pattern:
- `articles/[slug].astro` — Blog article pages (slug = article ID)
- `events/[slug].astro` — Event pages (slug = event ID)

Static pages: index, casa, therapies, residencies, workshops, solar-man, coracao-que-canta, sagrado-coracao, about-me, contacts, blog, events.

### Directus Collections

Primary CMS collections: `articles`, `events`, `pages`, `testimonials`, `services`. Articles and events are filtered by `status: "published"`.

### Styling

Three layers:
1. **CSS custom properties** in `src/stylesheet/main.css` — color scheme, fonts, layout classes
2. **Tailwind CSS** — utility classes for layout and responsive design
3. **Scoped `<style>` blocks** — component-level styles in `.astro` files

Design tokens: `--foreground-accent: #504b39`, `--foreground-subdued: #c5d6a8`, `--background-main: #f6f6f6`, `--background-alt: #c5d6a8`. Fonts: Quicksand (sans), Chonburi (serif/decorative).

### Components

- `Layout.astro` — Main page wrapper (Header + Footer + SEO meta/JSON-LD)
- `Header.astro` — Sticky nav with responsive mobile burger menu (JS toggle)
- `Article.astro` / `EventCard.astro` — Content cards for listing pages
- `icons/` — SVG icon components

### Naming Conventions

- Pages: kebab-case (`about-me.astro`)
- Components: PascalCase (`EventCard.astro`)
- No path aliases; uses relative imports

## Language

The site is primarily in Portuguese (pt-PT). Dates are formatted with `pt-PT` locale. A `feature/translations` branch exists for multi-language work.

## Git

Repository: `git@github.com:jmciso/coracao-web.git` (git root is `coracao-web/`). Primary branch: `master`. Active development branch: `migration/v5`.

## Migration Status

**Completed:**
- Astro v1 → v5 migration (all pages, components, layout)
- Directus SDK v10 → v21 migration (composable API)
- Tailwind v3 → v4 migration (CSS-first config)
- Mock Directus server for build testing
- Code cleanup: removed dead code, fixed bugs, dropped unused deps

**Pending (on Linux server):**
- Directus CMS v9.23.1 → v11.5.0 (see CMS-MIGRATION-GUIDE.md)
- Recover missing upload files (48 files in DB, uploads/ dir empty)
- Full end-to-end build with live CMS data
- Visual comparison of old vs new site
