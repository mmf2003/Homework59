import test from "node:test";
import assert from "node:assert/strict";

import { mkdtemp, readFile, writeFile, rm, access } from "node:fs/promises";

import { tmpdir } from "node:os";
import { join } from "node:path";

import { compressFile, decompressFile } from "./main.js";

// ========================================
// Test setup
// ========================================

async function createTestFiles(t) {
    const directory = await mkdtemp(join(tmpdir(), "gzip-homework-"));

    t.after(async () => {
        await rm(directory, {
            recursive: true,
            force: true,
        });
    });

    const source = join(directory, "source.txt");
    const content = "Hello Node.js! Привіт! ".repeat(100);

    await writeFile(source, content, "utf8");

    return { directory, source, content };
}

// ========================================
// Compression tests
// ========================================

test("Compresses a file successfully", async (t) => {
    const { source } = await createTestFiles(t);

    const result = await compressFile(source);

    assert.equal(result, `${source}.gz`);
    await access(result);
});

test("Compressed file is valid Gzip", async (t) => {
    const { source } = await createTestFiles(t);

    const result = await compressFile(source);
    const buffer = await readFile(result);

    assert.equal(buffer[0], 0x1f);
    assert.equal(buffer[1], 0x8b);
});

test("Creates unique compressed filenames", async (t) => {
    const { source } = await createTestFiles(t);

    const first = await compressFile(source);
    const second = await compressFile(source);
    const third = await compressFile(source);

    assert.notEqual(first, second);
    assert.notEqual(second, third);

    await access(first);
    await access(second);
    await access(third);
});

test("Compression preserves original file", async (t) => {
    const { source, content } = await createTestFiles(t);

    await compressFile(source);

    assert.equal(await readFile(source, "utf8"), content);
});

test("Compression rejects missing source", async (t) => {
    const { directory } = await createTestFiles(t);

    await assert.rejects(compressFile(join(directory, "missing.txt")), {
        code: "ENOENT",
    });
});

// ========================================
// Decompression tests
// ========================================

test("Decompresses file successfully", async (t) => {
    const { directory, source, content } = await createTestFiles(t);

    const compressed = await compressFile(source);

    const destination = join(directory, "decompressed.txt");

    const result = await decompressFile(compressed, destination);

    assert.equal(await readFile(result, "utf8"), content);
});

test("Creates unique decompressed filenames", async (t) => {
    const { directory, source } = await createTestFiles(t);

    const compressed = await compressFile(source);
    const destination = join(directory, "output.txt");

    const first = await decompressFile(compressed, destination);

    const second = await decompressFile(compressed, destination);

    assert.notEqual(first, second);

    await access(first);
    await access(second);
});

test("Does not overwrite existing destination", async (t) => {
    const { directory, source } = await createTestFiles(t);

    const compressed = await compressFile(source);
    const destination = join(directory, "existing.txt");

    await writeFile(destination, "Original content");

    const result = await decompressFile(compressed, destination);

    assert.notEqual(result, destination);

    assert.equal(await readFile(destination, "utf8"), "Original content");
});

test("Decompression rejects missing file", async (t) => {
    const { directory } = await createTestFiles(t);

    await assert.rejects(
        decompressFile(
            join(directory, "missing.gz"),
            join(directory, "output.txt"),
        ),
        { code: "ENOENT" },
    );
});

test("Decompression rejects invalid Gzip", async (t) => {
    const { directory, source } = await createTestFiles(t);

    const destination = join(directory, "invalid-output.txt");

    await assert.rejects(decompressFile(source, destination), {
        code: "Z_DATA_ERROR",
    });

    await assert.rejects(access(destination), { code: "ENOENT" });
});

// ========================================
// Round-trip test
// ========================================

test("Compression and decompression preserve data", async (t) => {
    const { directory, source, content } = await createTestFiles(t);

    const compressed = await compressFile(source);

    const restored = await decompressFile(
        compressed,
        join(directory, "restored.txt"),
    );

    assert.equal(await readFile(restored, "utf8"), content);
});
