# BYOBS

Bring Your Own Basic Server or Bring Your Own Barebones Server. A minimal BYOS implementation for TRMNL with no fancy widgets, WYSIWYG dashboards, or other bloat -- just name a URL, and BYOBS will serve a screenshot of the page to your device!

Useful for if you already have a webpage you want to display, or if you (like me!) prefer to make your own dashboard with HTML/CSS for more granular control. Can also be used as a starter for more complex use cases.

## Requirements

Requires Node v26+.

## Installation

1. Create an `.env` file (see below for sample file)
2. `docker compose up --build`

Note that the docker container is set up to foward the configuration stuff to a different port than the one that the actual devices will be talking to. This is to facilitate allowing different access to each.

### Sample `.env` File

```
# .env file

PORT = 8081
DOMAIN = <Your Domain or IP address and port>
```

To enable developer mode, add `MODE = DEV`. Currently all this does is enable a page to facilitate testing the API endpoints (`<your-domain-or-ip>/testing`)

## Usage

### Adding or Configuring a Device

While the server is running, you can go to `<your-domain-or-ip>/config` on your browser to access the device configuration page. From here, you can add new devices or modify the configuration for existing ones. 

For devices that support it, pointing the device at the `api/setup` end point will also add the device.

### Device Settings

| Setting | Value |
| --- | --- |
| ID | The device's ID. In TRMNL devices, this would be the MAC address. |
| Name | A human-readable name for the device (Optional) |
| Width | The device resolution's width |
| Height | The device resolution's height |
| Prefer BMP | Whether to send back a BMP image instead of a PNG |
| Grayscale Depth | Number of bits of grayscale that the device can display |
| Color Depth | Number of bits of each color that the device can display. For BW screens, this is 0 |
| URL | The URL of the page you would like the device to display |
| API Key | Generated per device, and used by BYOBS as the screenshot's filename |

Custom BYOD devices can also pass all values as query parameters with the `api/setup` GET request.

The generated images will be stored at `renders/<device API key>.png` or `renders/<device API key>.bmp`, so you can always look there to see what your device is currently (or should currently) be displaying.

## Technical Details

Why is this in Node.js? Because it was originally part of a separate project (which was in Node) before I decided to separate this out into its own thing.

### Known Issues

Puppeteer has trouble accessing external websites with anti-bot measures. There are ways around this but I haven't investigated them yet.

## License

ISC, with the caveat that you do not use my code for purposes that are explicitly harmful to other humans (including harrassment, hate speech, etc). I'd also love to hear from you if you found anything I made useful!