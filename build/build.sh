SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..

BUILD_CONTEXT=$ROOT_PATH

docker build -t master-mind-wp3 -f $BUILD_CONTEXT/build/Dockerfile $BUILD_CONTEXT