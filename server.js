import express from "express";

import * as constants from "./constants.js";
import * as utils from "./utils.js";

import { updateOrAddDevice, addLog, getDeviceFromId, getDevicesData, saveDevicesData } from "./devices.js";
import { generateImage } from "./render.js";

startServer();

function startServer() {
    const app = express();

    app.use("/config", express.static(constants.PAGES_ABS_PATH));
    app.use(constants.RENDERS_REL_URL, express.static(constants.RENDERS_ABS_PATH));
    app.use(constants.WELCOME_REL_URL, express.static(constants.WELCOME_ABS_PATH));

    if (constants.IS_DEV_MODE) {
        console.log("[server.js] !!! SERVER IS RUNNING IN DEV MODE !!!")
        app.use("/testing", express.static(constants.TESTING_ABS_PATH));
    }

    app.use(express.json());

    // TRMNL api endpoints

    app.get("/api/display", async (req, res) => {
        const device = await getDeviceFromId(req.get("ID"));
        if (device) {
            const renderedFilename = await generateImage(device);
            if (renderedFilename) {
                res.json({
                    filename: renderedFilename,
                    image_url: `${constants.RENDERS_ABS_URL}/${renderedFilename}?t=${Temporal.Now.instant().epochMilliseconds}`
                });
                return;
            }
        }
        res.status(400).json({
            message: "Something went wront :("
        });
    });

    app.get("/api/setup", async (req, res) => {
        const deviceId = req.get("ID"),
            query = req.query;
        if (!deviceId) {
            res.status(400).json({
                message: "Missing device ID!"
            });
            return;
        }
        const newApiKey = await updateOrAddDevice(deviceId, query);
        console.log({ newApiKey });
        if (newApiKey) {
            res.json({
                api_key: newApiKey,
                image_url: constants.WELCOME_IMG_ABS_URL,
                message: "Welcome to BYOBS :)",
                status: 200
            });
        } else {
            res.status(400).json({
                message: "Something went wront :("
            });
        }
    });

    app.post("/api/log", async (req, res) => {
        const log = req.body;
        if (await addLog(log)) {
            res.status(204).json({
                message: "Logged!"
            });
        } else {
            res.status(400).json({
                message: "Failed to log :("
            });
        }
    });

    // Config page endpoints

    app.get("/config/devices", async (req, res) => {
        console.log("[server.js] GET request for /config/devices");
        let devicesData = await getDevicesData();
        if (!devicesData) {
            console.log("[server.js] No existing devices data found");
            devicesData = {};
        };
        res.json(devicesData);
    });

    app.post("/config/devices", async (req, res) => {
        console.log("[server.js] POST request for /config/devices");
        const newConfigs = req.body;
        if (await saveDevicesData(newConfigs)) {
            res.status(200).json({
                message: "Device configs saved successfully!",
                data: newConfigs
            });
        }
        else (res.status(400).json({
            message: "Something went wrong :("
        }));
    });

    app.listen(constants.PORT, "0.0.0.0", () => {
        console.log(`[server.js] BYOBS is listening on ${constants.PORT}`);
    });
}