#!/usr/bin/env bash
# Chrome Web Store'a yüklenecek ZIP'i üretir.
# Sadece eklentinin runtime için gerekli dosyaları içerir; dev/, .idea/, *.md hariç.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

VERSION=$(grep '"version"' manifest.json | head -1 | sed -E 's/.*"([0-9.]+)".*/\1/')
OUTPUT="faceit-ping-viewer-${VERSION}.zip"

# Icons kontrolü
for size in 16 48 128; do
  if [ ! -f "icons/icon${size}.png" ]; then
    echo "❌ icons/icon${size}.png eksik. icons/generate.html'i tarayıcıda açıp PNG'leri indirin."
    exit 1
  fi
done

rm -f "$OUTPUT"

zip -r "$OUTPUT" \
  manifest.json \
  src/background.js \
  src/content.js \
  src/ping.js \
  src/storage.js \
  src/servers.js \
  src/detector.js \
  src/overlay.css \
  src/popup.html \
  src/popup.js \
  icons/icon16.png \
  icons/icon48.png \
  icons/icon128.png

echo ""
echo "✅ $OUTPUT hazır ($(du -h "$OUTPUT" | cut -f1))"
echo ""
echo "Web Store'a yüklemek için:"
echo "  https://chrome.google.com/webstore/devconsole → 'New item' → ZIP'i yükle"
