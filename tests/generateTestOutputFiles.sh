#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..
TESTS_PATH=$SCRIPT_PATH

TEST_FILES=$(find $TESTS_PATH -type f -name "*.js" ! -name "*_jalangi_.js")
TEST_OUTPUT_DIRECTORY=$TESTS_PATH/output_files

if [ -d "$TEST_OUTPUT_DIRECTORY" ]; then
	rm -R $TEST_OUTPUT_DIRECTORY
fi

mkdir $TEST_OUTPUT_DIRECTORY

for file in $TEST_FILES; do
	filename=$(basename "$file")

	echo "Generating output file for $filename ..."
    $ROOT_PATH/run $file > $TEST_OUTPUT_DIRECTORY/output_$filename.json
done