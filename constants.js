import * as path from "node:path";

export const PORT = process.env.PORT || 8081;
export const BASE_URL = process.env.DOMAIN;

export const IS_DEV_MODE = process.env.MODE === "DEV" || false;

// Pages used for testing
export const TESTING_REL_PATH = "./testing";
export const TESTING_ABS_PATH = path.join(process.cwd(), TESTING_REL_PATH);

// Web interface for managing the devices etc
export const PAGES_REL_PATH = "./pages";
export const PAGES_ABS_PATH = path.join(process.cwd(), PAGES_REL_PATH);

// Where the captured screenshots live
export const RENDERS_REL_PATH = "./renders";
export const RENDERS_ABS_PATH = path.join(process.cwd(), RENDERS_REL_PATH);
export const RENDERS_REL_URL = "/renders";
export const RENDERS_ABS_URL = BASE_URL + RENDERS_REL_URL;

// File storing info about the devices
export const DEVICES_REL_PATH = "./devices.json";
export const DEVICES_ABS_PATH = path.join(process.cwd(), DEVICES_REL_PATH);

// Logs received from devices
export const LOG_REL_PATH = "./log.txt";
export const LOG_ABS_PATH = path.join(process.cwd(), LOG_REL_PATH);

// Welcome values
export const WELCOME_PAGE_REL_URL = "/welcome.html";
export const WELCOME_PAGE_ABS_URL = BASE_URL + WELCOME_PAGE_REL_URL;
export const WELCOME_IMG_REL_URL = "/welcome.bmp";
export const WELCOME_IMG_ABS_URL = BASE_URL + WELCOME_IMG_REL_URL;
