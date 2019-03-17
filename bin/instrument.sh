#!/bin/bash

TARGET=$1
OUTPUT_DIR=$2
SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..

JALANGI_PATH=$(npm explore jalangi2 --prefix $ROOT_PATH -- pwd 2>/dev/null)


node $JALANGI_PATH/src/js/commands/instrument.js \
	--outputDir $OUTPUT_DIR \
	$TARGET
