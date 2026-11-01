# Node.js Gzip Compression & Decompression — Homework59

A Node.js application for asynchronous file compression and decompression using the Gzip algorithm and native Node.js streams.

The project demonstrates file system operations, stream pipelines, error handling, automatic generation of unique filenames, and data integrity verification.

## Features

- Asynchronous file compression using Gzip
- Asynchronous file decompression using Gunzip
- Automatic generation of unique output filenames
- Protection against overwriting existing files
- Stream-based processing for memory efficiency
- Error handling for missing or invalid files
- Cleanup of incomplete output files on failure
- Data integrity verification after decompression
- Automated testing with Node.js Test Runner

## Technologies

- Node.js
- JavaScript (ES Modules)
- `node:fs`
- `node:fs/promises`
- `node:zlib`
- `node:stream/promises`
- `node:path`
- `node:test`
- `node:assert/strict`

No external dependencies are required.

## Project Structure

```text
Homework59/
├── files/
│   └── source.txt
├── main.js
├── test.js
├── demo.js
├── package.json
└── README.md
```

## Installation and Running

### 1. Clone the repository

```bash
git clone https://github.com/mmf2003/Homework59.git
```

### 2. Navigate to the project directory

```bash
cd Homework59
```

### 3. Run the application

```bash
npm start
```

This executes `main.js`, which exports the compression and decompression functions.

### 4. Run the demonstration

```bash
npm run demo
```

The demonstration compresses `files/source.txt`, decompresses the generated archive, and verifies that the restored content matches the original.

### 5. Run automated tests

```bash
npm test
```

No `npm install` is necessary because the application uses only built-in Node.js modules.

## Implemented Functions

### 1. compressFile(filePath)

Asynchronously compresses a file using Gzip.

**Parameters:**

- `filePath` — path to the source file.

**Returns:** `Promise<string>` containing the path to the compressed file.

**Example:**

```javascript
import { compressFile } from "./main.js";

const compressedPath = await compressFile("./files/source.txt");

console.log(compressedPath);
```

Example output:

```text
./files/source.txt.gz
```

If the destination already exists, a unique filename is generated:

```text
source.txt.gz
source.txt_1.gz
source.txt_2.gz
```

The original file is preserved.

### 2. decompressFile(compressedFilePath, destinationFilePath)

Asynchronously decompresses a Gzip archive.

**Parameters:**

- `compressedFilePath` — path to the compressed Gzip file.
- `destinationFilePath` — requested destination path.

**Returns:** `Promise<string>` containing the path to the decompressed file.

**Example:**

```javascript
import { decompressFile } from "./main.js";

const restoredPath = await decompressFile(
    "./files/source.txt.gz",
    "./files/source_decompressed.txt",
);

console.log(restoredPath);
```

If the destination exists, the function generates a unique filename rather than overwriting it.

## Complete Usage Example

```javascript
import { readFile } from "node:fs/promises";

import { compressFile, decompressFile } from "./main.js";

async function run() {
    try {
        const source = "./files/source.txt";

        const compressed = await compressFile(source);

        const restored = await decompressFile(
            compressed,
            "./files/restored.txt",
        );

        const originalData = await readFile(source);
        const restoredData = await readFile(restored);

        console.log("Content matches:", originalData.equals(restoredData));
    } catch (error) {
        console.error("Operation failed:", error.message);
    }
}

run();
```

## Automated Testing

The project contains 11 automated tests covering:

1. Successful file compression
2. Valid Gzip archive generation
3. Unique compressed filenames
4. Original file preservation
5. Missing source file handling
6. Successful decompression
7. Unique decompressed filenames
8. Protection against overwriting existing files
9. Missing compressed file handling
10. Invalid Gzip data handling
11. Data integrity after compression and decompression

Run:

```bash
npm test
```

### Test Results

Latest local test execution:

```text
tests 11
pass 11
fail 0
cancelled 0
skipped 0
duration_ms 162.4565
```

All 11 automated tests passed successfully.

## Demonstration Results

The demonstration was executed successfully:

```text
COMPRESSION TEST
Original size: 40 bytes
Compressed size: 60 bytes

DECOMPRESSION TEST
Content matches: true
```

The compressed file is larger than the original because Gzip adds metadata and compression headers. This is normal for very small files.

## Error Handling

The application handles common file system and compression errors:

| Error          | Description                                              |
| -------------- | -------------------------------------------------------- |
| `ENOENT`       | Source file or directory does not exist                  |
| `EACCES`       | Insufficient file system permissions                     |
| `EEXIST`       | Destination already exists; another filename is selected |
| `Z_DATA_ERROR` | Invalid compressed data                                  |
| Other errors   | Propagated to the caller for handling                    |

Incomplete output files are removed when a processing operation fails after creating the destination.

## Security and Reliability

- Existing destination files are protected using exclusive creation mode (`wx`).
- Files are processed using streams rather than loading the entire file into memory.
- Source files are not modified.
- Unexpected errors are propagated to the calling function.
- Temporary incomplete output files are cleaned up when possible.
- Compression and decompression results can be verified using byte-for-byte comparison.

## Limitations

- Supports Gzip compression only.
- Does not support ZIP or RAR archives.
- Does not encrypt compressed files.
- Does not provide a graphical user interface.
- Destination directories must already exist.
- Does not impose a maximum decompressed file size.
- Intended for educational use rather than untrusted production workloads.

## Repository

https://github.com/mmf2003/Homework59
