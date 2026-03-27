#!/bin/bash
# Backup Directus CMS database and uploads
# Run from the cms/ directory where docker-compose.yml lives
#
# Usage: ./backup.sh

set -euo pipefail

DATE=$(date +%Y-%m-%d)
BACKUP_DIR=./backups

mkdir -p "$BACKUP_DIR"

echo "Dumping database..."
docker compose exec -T database pg_dump -U directus directus > "$BACKUP_DIR/pgdump_$DATE.sql"
echo "  -> $BACKUP_DIR/pgdump_$DATE.sql ($(du -h "$BACKUP_DIR/pgdump_$DATE.sql" | cut -f1))"

echo "Archiving uploads..."
tar czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C . uploads/
echo "  -> $BACKUP_DIR/uploads_$DATE.tar.gz ($(du -h "$BACKUP_DIR/uploads_$DATE.tar.gz" | cut -f1))"

# Keep last 5 backups of each type
ls -t "$BACKUP_DIR"/pgdump_*.sql 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
ls -t "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true

echo "Done. Backups in $BACKUP_DIR/"
