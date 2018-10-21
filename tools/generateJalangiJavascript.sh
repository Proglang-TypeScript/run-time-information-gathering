#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..

mkdir $ROOT_PATH/tmp
touch $ROOT_PATH/tmp/tmp.html

$ROOT_PATH/runBrowser.sh $ROOT_PATH/tmp

cat $ROOT_PATH/output_browser/tmp/tmp.html | node $SCRIPT_PATH/extractJavascriptContent.js > $SCRIPT_PATH/jalangi.js

rm -R $ROOT_PATH/tmp