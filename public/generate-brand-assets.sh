#!/bin/bash
# TinyCoder Brand Asset Generator — resized from AI-generated sources
# Sources: twitter_avatar.png (1254x1254), twitter_banner.png (2172x724), gumroad_store_header.png (1677x938)
# Run this to regenerate all derivatives after replacing sources

set -e
AVATAR_SRC="twitter_avatar.png"
TW_BANNER_SRC="twitter_banner.png"
GM_BANNER_SRC="gumroad_store_header.png"

# Avatar + PWA icons (from AI avatar)
convert "$AVATAR_SRC" -resize 512x512 -define png:compression-level=9 icons/icon-512.png
convert "$AVATAR_SRC" -resize 192x192 -define png:compression-level=9 icons/icon-192.png
convert "$AVATAR_SRC" -resize 400x400 -define png:compression-level=9 tc-avatar-400.png
convert "$AVATAR_SRC" -resize 180x180 -define png:compression-level=9 tc-avatar-180.png
convert "$AVATAR_SRC" -resize 64x64 -define png:compression-level=9 tc-avatar-64.png
convert "$AVATAR_SRC" -resize 32x32 -define png:compression-level=9 tc-avatar-32.png
convert "$AVATAR_SRC" -resize 32x32 -define png:compression-level=9 favicon.png

# Banners (exact platform specs)
convert "$TW_BANNER_SRC" -resize 1500x500! -define png:compression-level=9 tc-banner-twitter.png
convert "$GM_BANNER_SRC" -resize 1280x716! -define png:compression-level=9 tc-banner-gumroad-1280.png
convert "$GM_BANNER_SRC" -resize 680x380! -define png:compression-level=9 tc-banner-gumroad.png

echo "All brand assets regenerated from AI sources."
