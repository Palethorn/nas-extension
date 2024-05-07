#!/bin/bash
rm -f dist/nas-extension-firefox.zip nas-extension-source.zip 
cp src/firefox_manifest.json src/manifest.json 
zip -r nas-extension-source.zip . -x "node_modules/*" ".git/*" ".angular/*" ".vscode/*" "dist/*" "nas-extension-source.zip"
cd dist/nas-extension-firefox
zip -r ../nas-extension-firefox.zip *