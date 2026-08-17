import path from 'node:path';
import * as fs from 'node:fs';
import puppeteer from "puppeteer";
import sharp from 'sharp';
import bmp from 'sharp-bmp';

import * as constants from "./constants.js";
import * as utils from "./utils.js";

export async function generateImage(device) {
    const screenshotSuccess = await takeScreenshot(device.url, device.width, device.height, device.api_key);
    if (!screenshotSuccess) return false;

    const processedImgDir = path.join(constants.RENDERS_ABS_PATH, `./${device.api_key}`);
    try {
        await fs.promises.rm(processedImgDir, { recursive: true });
    } catch (error) {
        console.error("[render.js] failed to remove existing img dir");
    }

    const processedFilename = await postprocess(device.grayscale_depth, device.color_depth, device.api_key, device.prefer_bmp, processedImgDir);
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

async function postprocess(grayscaleDepth, colorDepth, apiKey, preferBmp, imgDir) {
    try {
        // const originalScreenshotPath = path.join(constants.RENDERS_ABS_PATH, `${apiKey}--original.png`),
        //     image = await Jimp.read(originalScreenshotPath);

        // if (colorDepth == 0) {
        //     image.greyscale();
        //     image.dither();
        //     image.quantize({ colors: 2 ** grayscaleDepth, imageQuantization: "atkinson" });
        //     // image.posterize(2 ** grayscaleDepth);
        //     // quantize refuses to keep blacks and whites pures. More investigation is needed
        // }
        
        // const time = Date.now();
        // const filename = preferBmp ? `${time}.bmp` : `${time}.png`;
        // await fs.promises.mkdir(imgDir, { recursive: true });

        // await image.write(path.join(imgDir, filename), { quality: 30 });

        // return filename;


        const originalScreenshotPath = path.join(constants.RENDERS_ABS_PATH, `${apiKey}--original.png`);
        const time = Date.now();
        const filename = preferBmp ? `${time}.bmp` : `${time}.png`;
        const outputFilePath = path.join(imgDir, filename);

        await fs.promises.mkdir(imgDir, { recursive: true });
        
        const image = await sharp(originalScreenshotPath).removeAlpha();
        // Operations to experiment with: gamma, normalize

        let maxColors = 256;

        if (colorDepth == 0) {
            maxColors == 2 ** grayscaleDepth;
            
            await image.grayscale();
            
            if (grayscaleDepth == 1) {
                await image.toColorspace("b-w");
            } else if (grayscaleDepth <= 4) {
                await image.toColorspace("grey16");
            }
        } else {
            await image.toColorspace("rgb16");
        }

        await image.png({
            compressionLevel: 9,
            palette: true,
            dither: 1,
            colors: maxColors
        });

        if (preferBmp) {
            await bmp.sharpToBmp(image, outputFilePath);
        } else {
            await image.toFile(outputFilePath);
        }

        return filename;
        
    } catch (error) {
        console.error("[render.js] Error postprocessing screenshot", error);
    }
}