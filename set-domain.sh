#!/usr/bin/env bash
# İstifadə: ./set-domain.sh https://mening-domenim.az   (sonda "/" olmadan)
set -e
[ -z "$1" ] && { echo "Domen yaz: ./set-domain.sh https://mening-domenim.az"; exit 1; }
sed -i "s#https://DOMEN.az#$1#g" *.html sitemap.xml robots.txt
echo "Hazırdır: $1"
