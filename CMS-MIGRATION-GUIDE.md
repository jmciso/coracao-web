# Directus CMS Migration Guide: v9.23.1 → v11.5.0

## Overview

Migrate the Casa Coracao Directus CMS from v9.23.1 to v11.5.0. The web frontend
(`coracao-web-v2/` on the `migration/v5` branch) has already been migrated to
Astro v5.18 + Directus SDK v21 (v11 line) + Tailwind v4.

## Current State (cms-bkp/)

| Component        | Version/Detail                      |
|------------------|-------------------------------------|
| Directus         | 9.23.1 (pinned in docker-compose)   |
| PostgreSQL       | 13 with PostGIS (`postgis/postgis:13-master`) |
| Database size    | 726 KB SQL dump, 112 MB data dir    |
| Custom collections | `articles` (2 records), `events` (2 records) — both UUID PKs |
| Files            | 48 entries in `directus_files` table |
| Users            | 3 users, 2 roles (Administrator, Reader) |
| Permissions      | Public read access on articles, events, directus_files |
| Flows/Webhooks   | None                                |
| M2M relations    | None                                |
| Cache            | Disabled (no Redis)                 |

### Files in cms-bkp/

```
cms-bkp/
├── .env                              # Full env config (has secrets)
├── docker-compose.yml                # Active compose (directus:9.23.1)
├── docker-compose.yml.bak            # Backup (uses directus:latest)
├── mysql.docker-compose.yml          # MySQL variant (unused)
├── INSTRUCOES.MD                     # Portuguese deploy notes
├── backup_directus_2024-09-29.tar.gz # 24 MB full backup tarball
├── backups/
│   └── pgdump_directus_2024-09-29.sql  # 726 KB SQL dump
├── data/database/                    # 112 MB PostgreSQL data directory
└── uploads/                          # EMPTY — files missing (see below)
```

### Known Issue: Missing Uploads

The `uploads/` directory is **empty** but the database references 48 files in
`directus_files`. These physical files need to be recovered from:

1. **The 24 MB tarball** — `tar xzf backup_directus_2024-09-29.tar.gz` and check for uploads inside
2. **The live/original server** — if still running, rsync the uploads directory
3. **Re-upload** — last resort, re-upload through CMS admin UI

## Migration Steps

### Prerequisites

- Docker and Docker Compose installed on the Linux server
- The `cms-bkp/` folder transferred to the server
- Node 22+ installed (for the Astro build in step 6)

### Step 1: Backup Current State

```bash
cd /path/to/casa-coracao
cp -r cms-bkp/ cms-bkp-pre-v11/
```

### Step 2: Investigate the Tarball for Missing Uploads

```bash
# List contents without extracting
tar tzf cms-bkp/backup_directus_2024-09-29.tar.gz | head -50

# If uploads are inside, extract just the uploads:
tar xzf cms-bkp/backup_directus_2024-09-29.tar.gz --include='*/uploads/*' -C cms-bkp/
```

### Step 3: Update docker-compose.yml

Only one line changes — the Directus image version:

```yaml
services:
  database:
    container_name: coracao-db
    image: postgis/postgis:13-master
    restart: unless-stopped
    ports:
      - "8001:5432"
    volumes:
      - ./data/database:/var/lib/postgresql/data
    env_file:
      - .env

  directus:
    container_name: coracao-cms
    image: directus/directus:11.5.0    # <-- CHANGED from 9.23.1
    restart: unless-stopped
    ports:
      - 8055:8055
    volumes:
      - ./uploads:/directus/uploads
    depends_on:
      - database
    env_file:
      - .env
```

### Step 4: Add Optional Env Vars

Append to `.env` (existing vars are all compatible with v11):

```bash
# Optional: disable anonymous telemetry
TELEMETRY=false
```

No other `.env` changes needed. All existing vars (`DB_CLIENT=pg`, `DB_HOST`,
`KEY`, `SECRET`, `ADMIN_EMAIL`, etc.) remain valid.

### Step 5: Start Services & Auto-Migrate

```bash
cd cms-bkp/

# Pull the new image
docker compose pull

# Start (Directus auto-detects old schema and runs migrations)
docker compose up -d

# Watch migration logs (look for "Running migration: 20xxxxxx...")
docker compose logs -f directus
```

**What happens automatically:**
- Directus detects the v9 database schema
- Runs ~50+ pending migrations (v9 → v10 → v11 internal steps)
- Converts role-based permissions to policy-based system (v11)
- Creates matching policies for existing roles
- Server starts at http://localhost:8055

**If migration fails:**
```bash
docker compose down
# Restore from backup:
cp -r cms-bkp-pre-v11/data/database/ cms-bkp/data/database/
# Try again or debug from logs
```

### Step 6: Verify CMS

```bash
# Health check
curl http://localhost:8055/server/health
# Expected: {"status":"ok"}

# Public API — articles
curl "http://localhost:8055/items/articles?filter[status][_eq]=published"
# Expected: JSON with 2 articles

# Public API — events
curl "http://localhost:8055/items/events?filter[status][_eq]=published"
# Expected: JSON with 2 events

# Admin UI — open in browser
# http://localhost:8055
# Login with ADMIN_EMAIL / ADMIN_PASSWORD from .env
# Check: articles, events, files, users, permissions (now "policies")
```

### Step 7: Full Astro Build Against Live CMS

```bash
cd coracao-web/   # This is the migration/v5 branch
git checkout migration/v5

# Create .env pointing to the local CMS
cat > .env << 'EOF'
PUBLIC_API_URL=http://localhost:8055/
DIRECTUS_STATIC_TOKEN=<your-static-token-from-directus>
EOF

# Install and build
npm install
npm run build

# Expected: all pages generated (static + dynamic articles/events)
# Check dist/ for generated HTML files
```

**To get the static token:**
1. Login to Directus admin at http://localhost:8055
2. Go to Settings → Access Tokens (or user profile)
3. Create a static token with read permissions
4. Paste it into the .env file

### Step 8: Visual Comparison (Optional)

Run both old and new sites side-by-side:

```bash
# Terminal 1: old site (if coracao-web/ still works on this machine)
cd coracao-web && npm run dev -- --port 3000

# Terminal 2: new site
cd coracao-web && git checkout migration/v5 && npm run dev -- --port 4321
```

Compare: homepage, blog listing, single article, events listing, single event, mobile nav.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Auto-migration fails | Low | High | Full backup in cms-bkp-pre-v11/ to restore from |
| Permission breakage (public API) | Low | Medium | Only public read needed; auto-migrates to policies |
| Missing uploaded files | Medium | Medium | Check tarball first, then original server |
| Env var incompatibility | Very Low | Low | Core vars unchanged; new ones are optional |
| PostgreSQL incompatibility | Very Low | Low | PG 13 fully supported by Directus 11 |

## Testing with Mock API (No Docker Needed)

If Docker is unavailable, the project includes a mock Directus server for build testing:

```bash
cd coracao-web/   # on migration/v5 branch

# Terminal 1: start mock server
node test/mock-directus.mjs
# Serves on http://localhost:8055

# Terminal 2: build with mock data
cat > .env << 'EOF'
PUBLIC_API_URL=http://localhost:8055/
DIRECTUS_STATIC_TOKEN=mock-token
EOF
npm run build
```

The mock server returns 2 test articles and 2 test events, enough to verify the
build pipeline works end-to-end.

## What Changed in the Web Frontend (Already Done)

For reference, the `migration/v5` branch already includes:

| Change | Details |
|--------|---------|
| Astro | 1.6.14 → 5.18.0 |
| Directus SDK | 10.3.1 → 21.1.0 (v11 composable API) |
| Tailwind CSS | 3.2.4 → 4.2.1 (CSS-first config) |
| Node.js | Requires 22+ (`.nvmrc` included) |
| SDK pattern | `new Directus(url)` → `createDirectus(url).with(rest()).with(staticToken())` |
| Query pattern | `items().readByQuery()` → `request(readItems())` |
| Response format | `response.data` array → direct array return |
| Sort syntax | `"-field"` string → `["-field"]` array |
| Bug fixes | HeroEvent variable name, Layout lang, double-slash in asset URLs |
| Dropped | Solid.js, graphql-request, Blog.astro, Nav.astro, tailwind.config.cjs |
