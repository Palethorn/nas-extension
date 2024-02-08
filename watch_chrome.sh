#!/bin/bash

rm -rf dist/nas-extension-chrome
mkdir -p dist/nas-extension-chrome
cp src/chrome_manifest.json dist/nas-extension-chrome/manifest.json
ng build --watch --configuration development --output-path dist/nas-extension-chrome
