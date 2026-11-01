console.log("#58. JavaScript homework example file");

import { createReadStream, createWriteStream } from "node:fs";
import { access, unlink } from "node:fs/promises";
import { constants } from "node:fs";
import { parse, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip, createGunzip } from "node:zlib";

// ========================================
// Helper: Check whether a file exists
// ========================================

async function fileExists(filePath) {
    try {
        await access(filePath, constants.F_OK);
        return true;
    } catch (error) {
        if (error.code === "ENOENT") {
            return false;
        }

        throw error;
    }
}

// ========================================
// Helper: Generate unique file path
// ========================================

async function getUniqueFilePath(filePath) {
    const { dir, name, ext } = parse(filePath);

    let candidate = filePath;
    let counter = 1;

    while (await fileExists(candidate)) {
        candidate = join(dir, `${name}_${counter}${ext}`);
        counter++;
    }

    return candidate;
}

// ========================================
// Helper: Process file using streams
// ========================================

async function processFile(inputPath, outputPath, transform) {
    const sourcePath = resolve(inputPath);
    const destinationPath = resolve(outputPath);

    if (sourcePath === destinationPath) {
        throw new Error("Source and destination must be different");
    }

    // Check source before creating destination.
    await access(sourcePath, constants.R_OK);

    let outputCreated = false;
    let currentPath = destinationPath;

    while (true) {
        currentPath = await getUniqueFilePath(currentPath);

        try {
            // Open destination exclusively before starting pipeline.
            const output = createWriteStream(currentPath, {
                flags: "wx",
            });

            await new Promise((resolveOpen, rejectOpen) => {
                output.once("open", resolveOpen);
                output.once("error", rejectOpen);
            });

            outputCreated = true;

            await pipeline(createReadStream(sourcePath), transform(), output);

            return currentPath;
        } catch (error) {
            if (error.code === "EEXIST" && !outputCreated) {
                currentPath = destinationPath;
                continue;
            }

            // Remove incomplete output on failure.
            if (outputCreated) {
                try {
                    await unlink(currentPath);
                } catch (cleanupError) {
                    if (cleanupError.code !== "ENOENT") {
                        console.error("Cleanup error:", cleanupError);
                    }
                }
            }

            throw error;
        }
    }
}

// ========================================
// #1. Compress File
// ========================================

/**
 * Compresses a file using Gzip.
 *
 * @param {string} filePath - Source file path.
 * @returns {Promise<string>} Path to the compressed file.
 * @throws {Error} File system or compression error.
 */
async function compressFile(filePath) {
    const outputPath = `${filePath}.gz`;

    return processFile(filePath, outputPath, () => createGzip());
}

// ========================================
// #2. Decompress File
// ========================================

/**
 * Decompresses a Gzip file to a destination.
 *
 * @param {string} compressedFilePath - Gzip file path.
 * @param {string} destinationFilePath - Output file path.
 * @returns {Promise<string>} Path to the decompressed file.
 * @throws {Error} File system or decompression error.
 */
async function decompressFile(compressedFilePath, destinationFilePath) {
    return processFile(compressedFilePath, destinationFilePath, () =>
        createGunzip(),
    );
}

export { compressFile, decompressFile };
