import path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from "puppeteer";
import {
    initializeImageMagick,
    ImageMagick,
    Magick,
    MagickFormat,
    Quantum,
} from '@imagemagick/magick-wasm';

import * as constants from "./constants.js";
import * as utils from "./utils.js";

const imageMagickPath = path.dirname(fileURLToPath(import.meta.resolve("@imagemagick/magick-wasm"))),
    imageMagickWasm = path.join(imageMagickPath, "./magick.wasm");

var imageMagickInitialized = false;

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
        browser = await puppeteer.launch({
            args: ["--no-sandbox"]
        });
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
    const originalScreenshotPath = path.join(constants.RENDERS_ABS_PATH, `${apiKey}--original.png`);
    const filename = preferBmp ? `${apiKey}.bmp` : `${apiKey}.png`;
    const processedImgPath = path.join(constants.RENDERS_ABS_PATH, filename);

    try {
        // const originalScreenshotPath = path.join(constants.RENDERS_ABS_PATH, `${apiKey}--original.png`),
        //     image = await Jimp.read(originalScreenshotPath);

        // if (colorDepth == 0) {
        //     image.greyscale();
        //     image.dither();
        //     image.posterize(2 ** grayscaleDepth);
        // }
        
        // const filename = preferBmp ? `${apiKey}.bmp` : `${apiKey}.png`;

        // await image.write(path.join(constants.RENDERS_ABS_PATH, filename));

        // return filename;

        

        if (!imageMagickInitialized) {
            console.log(imageMagickWasm);
            let wasmBuffer = await fs.promises.readFile(imageMagickWasm);
            await initializeImageMagick(wasmBuffer);
            imageMagickInitialized = true;
        }

        const imageBuffer = await fs.promises.readFile(originalScreenshotPath);

        console.log(Magick.imageMagickVersion);

        ImageMagick.read(new Uint8Array(imageBuffer), (image) => {
            console.log(`Image format: ${image.format}`);
            image.colorSpace("Gray");
        });
        return true;


    } catch (error) {
        console.error("[render.js] Error postprocessing screenshot", error);
    }
}