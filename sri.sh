#!/usr/bin/env bash
# CDN skriptləri üçün SRI hash-lərini hesablayıb index.html-ə yazır. İnternet lazımdır.
set -e
H() { curl -fsSL "$1" | openssl dgst -sha384 -binary | openssl base64 -A; }
G=$(H https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js)
S=$(H https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js)
sed -i "s#integrity=\"SRI-GSAP\"#integrity=\"sha384-$G\"#; s#integrity=\"SRI-ST\"#integrity=\"sha384-$S\"#" index.html
echo "GSAP: sha384-$G"; echo "ScrollTrigger: sha384-$S"
