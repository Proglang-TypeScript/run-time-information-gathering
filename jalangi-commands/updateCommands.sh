#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..

JALANGI_PATH=$(npm explore jalangi2 --prefix $ROOT_PATH -- pwd 2>/dev/null)

cp $ROOT_PATH/jalangi-commands/jalangi.js $JALANGI_PATH/src/js/commands/jalangi.js