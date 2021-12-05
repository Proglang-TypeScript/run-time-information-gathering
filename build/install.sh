#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..

git clone https://github.com/Samsung/jalangi2.git
npm install --prefix jalangi2/
mv jalangi2 node_modules

$ROOT_PATH/jalangi-commands/updateCommands.sh