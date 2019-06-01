SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..

TMP_OUTPUT_FILE=/tmp/output_temp_test_build.json

TEST_BUILD_CONTAINER=test-build-master-mind

docker rm -f test-build-master-mind &> /dev/null
docker run --name test-build-master-mind -v $SCRIPT_PATH/calculator/calculator.js:/tmp/file.js master-mind-wp3 /tmp/file.js > /dev/null
docker cp test-build-master-mind:/usr/local/app/output.json $TMP_OUTPUT_FILE
docker rm test-build-master-mind &> /dev/null

diff="$(diff $TMP_OUTPUT_FILE $SCRIPT_PATH/output_files/output_calculator.js.json)"

rm -f $TMP_OUTPUT_FILE

if [ -n "$diff" ]; then
	echo "Build nok!"
	exit 1
else
	echo "Build ok!"
	exit 0
fi