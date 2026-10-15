#!/usr/bin/env bash
# Minify olunmuş nüsxəni dist/ qovluğuna yazır. Mənbə fayllar toxunulmaz qalır. Node.js lazımdır.
set -e
rm -rf dist && mkdir -p dist/css dist/js
cp *.html *.png *.svg *.webmanifest robots.txt sitemap.xml dist/
[ -f CNAME ] && cp CNAME dist/
for f in css/*.css; do npx --yes esbuild "$f" --minify --outfile="dist/$f"; done
for f in js/*.js;  do npx --yes esbuild "$f" --minify --outfile="dist/$f"; done
echo "Hazırdır: dist/ (yayımlanan qovluq budur)"
