#!/bin/bash

rm -rf dist/nas-extension
mkdir -p dist/nas-extension
cp src/firefox_manifest.json dist/nas-extension/manifest.json
ng build --watch --configuration development