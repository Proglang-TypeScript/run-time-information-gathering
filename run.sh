#!/bin/bash

TARGET=$1
JALANGI_PATH=$(npm explore jalangi2 -- pwd 2>/dev/null)

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH

node $JALANGI_PATH/src/js/commands/jalangi.js \
    --inlineSource --inlineIID \
    --analysis $JALANGI_PATH/src/js/runtime/SMemory.js \
    --analysis $ROOT_PATH/analysis/analysis.js \
    $TARGET