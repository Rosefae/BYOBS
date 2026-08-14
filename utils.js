import * as fs from "node:fs";
import * as path from "node:path";

import * as constants from "./constants.js";

// ~~~~~~ Basic Helpers

/**
 * Wait before resuming execution
 * @param {int} time in ms 
 * @returns {Promise} a promise that will take ${time} ms to resolve
 */
export function sleep(time) {
    return new Promise((r) => setTimeout(r, time));
}

// ~~~~~~ File Handling

/**
 * Read file, but wait if it's currently busy
 * @param {PathLike} path 
 * @param {int} maxAttempts 
 * @param {int} timeBetweenAttempts in milliseconds
 * @returns 
 */
export async function readFilePatient(path, maxAttempts = 5, timeBetweenAttempts = 50) {
    let attempts = 0;
    while (attempts < maxAttempts) {
        try {
            const file = await fs.promises.readFile(path);
            return file;
        }
        catch (error) {
            if (error.code === "ENOENT" || error.code === "EBUSY") {
                attempts++;
                await sleep(timeBetweenAttempts);
            } else {
                throw error;
            }
        }
    }

    throw new Error(`Could not read ${path}: file busy even after ${maxAttempts} tries.`);
}

/**
 * Writes the file and creates all directories in path, if it doesn't already exist
 * @param {PathLike} filePath 
 * @param {string} data 
 */
export async function writeFileAndMakeDir(filePath, data) {
    try {
        const dir = path.dirname(filePath);
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(filePath, data);
    } catch (error) {
        console.error("Error writing file", error);
    }
}