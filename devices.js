import crypto from "node:crypto";

import * as constants from "./constants.js";
import * as utils from "./utils.js";

const DEVICE_DEFAULTS = {
    name: "New Device",
    width: 800,
    height: 480,
    prefer_bmp: false,
    grayscale_bits: 4,
    color_bits: 0,
    url: constants.WELCOME_PAGE_ABS_URL,
    api_key: ""
}

export async function getDevicesData() {
    let raw = await utils.readFilePatient(constants.DEVICES_ABS_PATH);
    let devicesData = JSON.parse(raw);
    console.log("[devices.js] Read devices from json file");
    return devicesData;
}

export async function getDeviceFromId(id) {
    try {
        const devicesData = await getDevicesData();
        return devicesData[id];
    } catch (error) {
        console.error("[devices.js] Cannot find device ID!", error);
    }
}

export async function deviceSetup(id, query) {
    id = String(id);
    let devicesData;
    try {
        devicesData = getDevicesData();
    } catch (error) {
        devicesData = {}
    }

    let device = devicesData[id];

    if (device) {
        console.log("[devices.js] Device already registered! Updating values");
    } else {
        console.log("[devices.js] Registering new device");
        device = {...DEVICE_DEFAULTS}
        devicesData[id] = device;
        device[api_key] = crypto.randomUUID();
    }

    for (const [key, value] of Object.entries(device)) {
        if (query.hasOwnProperty(key)) {
            device[key] = value;
        }
    }
    
    try {
        await utils.writeFileAndMakeDir(constants.DEVICES_ABS_PATH, JSON.stringify(devicesData));
        return device[api_key];
    } catch (error) {
        console.error("[devices.js] Error storing device configs", error);
    }

    return false;
}

export async function addLog(log) {
    try {
        await fs.promises.appendFile(constants.LOG_ABS_PATH, logString);
    } catch (error) {
        console.error("[devices.js] Error adding to log", error);
        return false;
    }
    return true
}