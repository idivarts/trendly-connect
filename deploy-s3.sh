#!/usr/bin/env bash
set -euo pipefail

# ╔════════════════════════════════════════════════╗
# ║   Configure before first deploy               ║
S3_BUCKET="trendly-connect"          # your S3 bucket name
AWS_REGION="us-east-1"
CLOUDFRONT_DISTRIBUTION_ID=""        # set after CloudFront setup
# ╚════════════════════════════════════════════════╝

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$SCRIPT_DIR/out"
DRY_RUN=false

for arg in "$@"; do
  case $arg in --dry-run) DRY_RUN=true ;; esac
done

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       Trendly Connect — S3 Deployment            ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

[ ! -d "$OUT_DIR" ] && echo "❌  Run export.sh first." && exit 1
! command -v aws &>/dev/null && echo "❌  AWS CLI not found." && exit 1

REGION_FLAG="--region $AWS_REGION"
DRY_FLAG=$( $DRY_RUN && echo "--dryrun" || echo "" )
S3_URI="s3://$S3_BUCKET"

echo "  Bucket: $S3_URI  |  Mode: $( $DRY_RUN && echo 'DRY RUN' || echo 'LIVE' )"
echo ""

# Static assets — 1-year cache
echo "📤  Uploading static assets…"
aws s3 sync "$OUT_DIR/_next/" "$S3_URI/_next/" \
  $REGION_FLAG $DRY_FLAG --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE

# HTML — no-cache
echo "📄  Uploading HTML pages…"
aws s3 sync "$OUT_DIR/" "$S3_URI/" \
  $REGION_FLAG $DRY_FLAG --delete \
  --exclude "_next/*" --include "*.html" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "public, no-cache, must-revalidate" \
  --metadata-directive REPLACE

# Root/SEO files
echo "🗺️   Uploading root files…"
aws s3 sync "$OUT_DIR/" "$S3_URI/" \
  $REGION_FLAG $DRY_FLAG \
  --exclude "_next/*" --exclude "*.html" \
  --cache-control "public, max-age=3600" \
  --metadata-directive REPLACE

# CloudFront invalidation
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ] && [ "$DRY_RUN" = false ]; then
  echo "☁️   Invalidating CloudFront…"
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" $REGION_FLAG \
    --query 'Invalidation.Id' --output text
fi

echo ""
echo "✅  Deployment complete!  →  https://connect.trendly.now"
echo ""
