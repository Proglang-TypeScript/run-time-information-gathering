## Master Mind - Work Package 3

### Installation
#### Docker
Install Docker.
https://docs.docker.com/install/

#### Build Docker image

```shell
git clone https://fcristiani@bitbucket.org/fcristiani/master-mind-wp3.git
```

```shell
cd master-mind-wp3
```

```shell
./build/build.sh
```

This will build an image called 'master-mind-wp3' on your local machine.

### Usage
#### Get runtime information from one JS file
Run the docker container mounting your file on /tmp/file.js.

```shell
docker run -it \
	-a stdout \
	-v ABS_PATH_TO_YOUR_FILE:/tmp/file.js  \
	master-mind-wp3
```

The runtime information will be printed to stdout. 

#### Example

```shell
docker run -it -a stdout -v $(pwd)/tests/calculator.js:/tmp/file.js master-mind-wp3
```