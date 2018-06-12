#!/bin/bash

TARGET=$1
JALANGI_PATH=$(npm explore jalangi2 -- pwd 2>/dev/null)

node $JALANGI_PATH/src/js/commands/jalangi.js \
    --inlineSource --inlineIID \
    --analysis $JALANGI_PATH/src/js/runtime/SMemory.js \
    --analysis analysis/debug.js \
    $TARGET