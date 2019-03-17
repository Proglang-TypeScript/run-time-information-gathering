#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..

npm install

git clone https://github.com/Samsung/jalangi2.git
npm install --prefix jalangi2/
mv jalangi2 node_modules

JALANGI_PATH=$(npm explore jalangi2 --prefix $ROOT_PATH -- pwd 2>/dev/null)

$ROOT_PATH/jalangi-commands/updateCommands.sh

echo "Installation complete!"