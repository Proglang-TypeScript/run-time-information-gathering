## Master Mind - Work Package 3

### Installation
Clone the repository and then run:

```
cd [into-the-repository]
./install.sh
```

### Run tests
```bash
./tests/runTests.sh
```

### Usage
#### Instrumentation of a single file
Run the instrumentation script.
```bash
./run.sh [FILE]
```

The output will be saved to the file `output.json`.

Example:
```bash
./run.sh tests/get_prop/getProp.js
```

#### Browser instrumentation
Run the browser instrumentation script.
```bash
./run.sh [ROOT_BROWSER_APP_DIRECTORY]
```

The output will be saved to the directroy `output_browser`.

Example:
```bash
./runBrowser.sh browser
```