#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..
TESTS_PATH=$SCRIPT_PATH

TEST_FILES=$(find $TESTS_PATH -type f -name "*.js" ! -name "*_jalangi_.js")
TEST_OUTPUT_DIRECTORY=$TESTS_PATH/output_files
TEST_OUTPUT_BACKUP_DIRECTORY=$TESTS_PATH/output_files_backup_master

for file in $TEST_FILES; do
	filename=$(basename "$file")

    diff="$(diff $TEST_OUTPUT_DIRECTORY/output_$filename.json $TEST_OUTPUT_BACKUP_DIRECTORY/output_$filename.json)"

    if [ -n "$diff" ]; then
		echo "$filename ..."
		echo $diff

		echo ""
	    echo "************"
	    echo "************"
		echo ""
    fi
done