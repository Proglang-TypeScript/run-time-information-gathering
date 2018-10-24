#!/bin/bash

npm install

git clone https://github.com/Samsung/jalangi2.git
npm install --prefix jalangi2/
mv jalangi2 node_modules

echo "Installation complete!"