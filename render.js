import path from 'node:path';
import * as fs from 'node:fs';
import puppeteer from "puppeteer";
import { Jimp } from "jimp";

import * as constants from "./constants.js";
import * as utils from "./utils.js";

export async function generateImage(device) {
    const screenshotSuccess = await takeScreenshot(device.url, device.width, device.height, device.api_key);
    if (!screenshotSuccess) return false;

    const processedFilename = await postprocess(device.grayscale_depth, device.color_depth, device.api_key, device.prefer_bmp);
    if (!processedFilename) return false;

    return processedFilename;
}

async function takeScreenshot(url, width, height, apiKey) {
    let browser;

    try {
        console.log("[render.js] Launching Puppeteer...");
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        console.log(`[render.js] Setting viewport size: ${width}x${height}`);
        await page.setViewport({ width: width, height: height });

        console.log(`[render.js] Accessing ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0' });

        console.log(`[render.js] Taking screenshot`);
        await fs.promises.mkdir(constants.RENDERS_ABS_PATH, { recursive: true });
        await page.screenshot({
            path: path.join(constants.RENDERS_ABS_PATH, `${apiKey}--original.png`)
        });

        console.log("[render.js] Screenshot success!")
        return true;
    } catch (error) {
        console.error("[render.js] Error creating screenshot", error);
    } finally {
        await browser.close();
    }
}

async function postprocess(grayscaleDepth, colorDepth, apiKey, preferBmp) {
    try {
        const originalScreenshotPath = path.join(constants.RENDERS_ABS_PATH, `${apiKey}--original.png`),
            image = await Jimp.read(originalScreenshotPath);

        if (colorDepth == 0) {
            image.greyscale();
        }
        
        const filename = preferBmp ? `${apiKey}.bmp` : `${apiKey}.png`;

        await image.write(path.join(constants.RENDERS_ABS_PATH, filename));

        return filename;
    } catch (error) {
        console.error("[render.js] Error postprocessing screenshot", error);
    }
}