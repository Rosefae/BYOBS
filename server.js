import express from "express";

import * as constants from "./constants.js";
import * as utils from "./utils.js";

import { updateOrAddDevice, addLog, getDeviceFromId, getDevicesData } from "./devices.js";
import { generateImage } from "./render.js";

startServer();

function startServer() {
    const app = express();

    app.use(express.static(constants.PAGES_ABS_PATH));
    app.use(constants.RENDERS_REL_URL, express.static(constants.RENDERS_ABS_PATH));

    // TRMNL api endpoints

    app.get("/api/display", async (req, res) => {
        const device = getDeviceFromId(req.get("ID"));
        if (device) {
            const renderedFilename = generateImage(device);
            if (renderedFilename) {
                res.json({
                    filename: renderedFilename,
                    image_url: `${constants.RENDERS_ABS_URL}/${renderedFilename}`
                });
            }
        }
        res.status(400);
    });

    app.get("/api/setup", async (req, res) => {
        const deviceId = req.get("ID"),
            query = req.query;
        const newApiKey = updateOrAddDevice(deviceId, query);
        if (newApiKey) {
            res.json({
                api_key: newApiKey,
                image_url: constants.WELCOME_IMG_ABS_URL,
                message: "Welcome to BYOBS :)",
                status: 200
            });
        } else {
            res.status(400);
        }
    });

    app.post("/api/log", async (req, res) => {
        const log = JSON.stringify(req.body);
        if (addLog(log)) {
            res.status(204);
        } else {
            res.status(400);
        }
    });

    // Config page endpoints

    app.get("/config/devices", async (req, res) => {
        if (!isLocal(req)) res.status(403);
        
        const devicesData = getDevicesData();
        if (!devicesData) devicesData = {};
        res.json(devicesData);
    });

    app.post("/config/devices", async (req, res) => {
        if (!isLocal(req)) res.status(403);
        console.log(req.body);
    });

    app.listen(constants.PORT, "0.0.0.0", () => {
        console.log(`[server.js] BYOBS is listening on ${constants.PORT}`);
    });
}

function isLocal(req) {
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}