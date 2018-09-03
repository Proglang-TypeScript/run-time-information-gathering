#!/bin/bash

TARGET=$1
JALANGI_PATH=$(npm explore jalangi2 -- pwd 2>/dev/null)

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH

node $JALANGI_PATH/src/js/commands/instrument.js --inlineIID --inlineSource \
	-i --inlineJalangi \
    --analysis $ROOT_PATH/utils/sMemory/sMemory.js \
    --analysis $ROOT_PATH/analysis/analysis.js \
	--outputDir output_browser \
	$TARGET