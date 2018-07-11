#!/bin/bash

SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..
TESTS_PATH=$SCRIPT_PATH

TEST_FILES=$(find $TESTS_PATH -type f -name "*.js" ! -name "*_jalangi_.js")
TEST_OUTPUT_DIRECTORY=$TESTS_PATH/output_files

failing_tests=()
for file in $TEST_FILES; do
	filename=$(basename "$file")

    $ROOT_PATH/run.sh $file > output_test_tmp.json
    diff="$(diff output_test_tmp.json $TEST_OUTPUT_DIRECTORY/output_$filename.json)"

    echo -n "."

    if [ -n "$diff" ]; then
    	failing_tests+=($filename)
    fi
done

echo ""

if [ ${#failing_tests[@]} -eq 0 ]; then
	echo "Passed!"
else
	echo "NOT passed!"
	echo "Failing tests:"
	for failing_test in $failing_tests; do
		echo "- $failing_test"
	done
fi


rm output_test_tmp.json