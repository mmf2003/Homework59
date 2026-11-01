import { stat, readFile } from "node:fs/promises";

import { compressFile, decompressFile } from "./main.js";

async function runDemo() {
    try {
        const source = "./files/source.txt";

        console.log("\nCOMPRESSION TEST");

        const compressed = await compressFile(source);

        console.log("Compressed file:", compressed);

        const originalStats = await stat(source);
        const compressedStats = await stat(compressed);

        console.log("Original size:", originalStats.size, "bytes");
        console.log("Compressed size:", compressedStats.size, "bytes");

        console.log("\nDECOMPRESSION TEST");

        const restored = await decompressFile(
            compressed,
            "./files/source_decompressed.txt",
        );

        console.log("Decompressed file:", restored);

        const originalContent = await readFile(source);
        const restoredContent = await readFile(restored);

        console.log(
            "Content matches:",
            originalContent.equals(restoredContent),
        );
    } catch (error) {
        console.error("Demo error:", error.message);
        process.exitCode = 1;
    }
}

runDemo();
