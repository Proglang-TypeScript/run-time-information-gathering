SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..

docker build -t master-mind-wp3 -f ./build/Dockerfile $ROOT_PATH