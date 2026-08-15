import crypto from "node:crypto";

import * as constants from "./constants.js";
import * as utils from "./utils.js";
import e from "express";

const DEVICE_DEFAULTS = {
    name: "New Device",
    width: 800,
    height: 480,
    prefer_bmp: false,
    grayscale_depth: 4,
    color_depth: 0,
    url: constants.WELCOME_PAGE_ABS_URL,
    api_key: ""
}

// Handle config

export async function getDevicesData() {
    try {
        let raw = await utils.readFilePatient(constants.DEVICES_ABS_PATH);
        let devicesData = JSON.parse(raw);
        console.log("[devices.js] Read devices from json file");
        return devicesData;
    } catch (error) {
        console.error("[devices.js] Could not load devices data from file", error);
        return null;
    }
}

export async function getDeviceFromId(id) {
    try {
        const devicesData = await getDevicesData();
        if (!devicesData) return null;
        if (!Object.hasOwn(devicesData, id)) return null;
        return devicesData[id];
    } catch (error) {
        console.error("[devices.js] Cannot find device ID!", error);
        return null;
    }
}

export async function updateOrAddDevice(id, query) {
    id = String(id);
    let devicesData = await getDevicesData();

    if (!devicesData) {
        devicesData = {}
    }

    let device;

    if (Object.hasOwn(devicesData, id)) {
        console.log("[devices.js] Device already registered! Updating values");
        device = { ...devicesData[id] };
    } else {
        console.log("[devices.js] Registering new device");
        device = {...DEVICE_DEFAULTS}
        device["api_key"] = crypto.randomUUID();
    }

    Object.entries(device).forEach(([key, value]) => {
        if (Object.hasOwn(query, key)) {
            device[key] = value;
        }
    });

    try {
        validateDeviceData(device);
    } catch (error) {
        console.error("[device.js] Data failed validation!", error);
    }

    devicesData[id] = device;
    console.log(device.api_key)

    if (await saveDevicesData(devicesData)) return device.api_key;
    else return null;
}

function validateDeviceData(device, tryToFix = true) {
    if (typeof device.name !== "string") {
        if (tryToFix) device.name = String(device.name);
        else throw new Error("[devices.js] Device name must be a string!");
    }

    if (!Number.isInteger(device.width)) {
        if (tryToFix) {
            let tryInt = parseInt(device.width);
            if (tryInt == NaN) throw new Error("[devices.js] Width must be an integer!");
            else device.width = tryInt;
        }
        else throw new Error("[devices.js] Width must be an integer!");
    }

    if (device.width <= 0) throw new Error("[devices.js] Width must be greater than 0!");

    if (!Number.isInteger(device.height)) {
        if (tryToFix) {
            let tryInt = parseInt(device.height);
            if (tryInt == NaN) throw new Error("[devices.js] Height must be an integer!");
            else device.height = tryInt;
        }
        else throw new Error("[devices.js] Height must be an integer!");
    }

    if (device.height <= 0) throw new Error("[devices.js] Height must be greater than 0!");

    if (typeof device.prefer_bmp !== "boolean") throw new Error("[devices.js] prefer_bmp must be a boolean!");

    if (!Number.isInteger(device.grayscale_depth)) {
        if (tryToFix) {
            let tryInt = parseInt(device.grayscale_depth);
            if (tryInt == NaN) throw new Error("[devices.js] Grayscale depth must be an integer!");
            else device.grayscale_depth = tryInt;
        }
        else throw new Error("[devices.js] Grayscale depth must be an integer!");
    }

    if (device.grayscale_depth <= 0) throw new Error("[devices.js] Grayscale depth must be greater than 0!");

    if (device.grayscale_depth > 16) throw new Error("[devices.js] Grayscale depth can be at most 16");

    if (!Number.isInteger(device.color_depth)) {
        if (tryToFix) {
            let tryInt = parseInt(device.color_depth);
            if (tryInt == NaN) throw new Error("[devices.js] Color depth must be an integer!");
            else device.color_depth = tryInt;
        }
        else throw new Error("[devices.js] Color depth must be an integer!");
    }

    if (device.color_depth < 0) throw new Error("[devices.js] Color depth cannot be negative!");

    if (device.grayscale_depth > 16) throw new Error("[devices.js] Color depth can be at most 16");

    return true;
}

export async function saveDevicesData(devicesData) {
    Object.entries(devicesData).forEach(([key, value]) => {
        if (!Object.hasOwn(value, "api_key") || value["api_key"] == "") {
            value["api_key"] = crypto.randomUUID();
        } 
    });

    try {
        await utils.writeFileAndMakeDir(constants.DEVICES_ABS_PATH, JSON.stringify(devicesData));
        return true;
    } catch (error) {
        console.error("[devices.js] Error storing device configs", error);
        return false;
    }
}

// Handle device logs

export async function addLog(log) {
    try {
        await fs.promises.appendFile(constants.LOG_ABS_PATH, logString);
        return true;
    } catch (error) {
        console.error("[devices.js] Error adding to log", error);
        return false;
    }
}